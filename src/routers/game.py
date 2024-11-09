from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from src.constants import errors
from src.database.crud.crud_user import (
    get_active_player_id_from_game,
    get_active_player_id_from_lobby,
)
from src.database.db import SessionDep
from src.routers.handlers.game.cancel_movement import handle_cancel_movement
from src.routers.handlers.game.chat_message import handle_chat_message
from src.routers.handlers.game.end_turn import handle_end_turn
from src.routers.handlers.game.gamestate import handle_gamestate
from src.routers.handlers.game.leave_game import handle_leave_game
from src.routers.handlers.game.movement_card import handle_movement_card
from src.routers.handlers.game.shape_card import handle_shape_card
from src.routers.handlers.lobby.game_start import handle_game_start
from src.routers.helpers.connection_manager import game_manager
from src.schemas import game_schemas, player_schemas
from src.schemas.message_schema import error_message
from src.tools.jsonify import deserialize

game_router = APIRouter()


@game_router.post('/game', status_code=200)
async def start_game(body: game_schemas.GameCreate, db: SessionDep):
    player_id = get_active_player_id_from_lobby(db, body.player_id, body.lobby_id)
    rc = await handle_game_start(
        db=db,
        player_id=player_id,
        lobby_id=body.lobby_id,
    )

    if rc == 1:
        raise HTTPException(status_code=404, detail=errors.LOBBY_NOT_FOUND)
    elif rc == 2:
        raise HTTPException(
            status_code=400,
            detail=errors.MUST_BE_OWNER,
        )
    elif rc == 3:
        raise HTTPException(status_code=400, detail=errors.NOT_ENOUGH_PLAYERS)
    elif rc == 4:
        raise HTTPException(status_code=404, detail=errors.PLAYER_IS_MISSING)


@game_router.post('/game/{game_id}/chat', status_code=200)
async def send_chat_message(
    message: game_schemas.SendChatMessage,
    game_id: str,
    db: SessionDep,
):
    rc = await handle_chat_message(
        game_id=game_id,
        msg=message,
        db=db,
    )

    if rc == 1:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)
    elif rc == 2:
        raise HTTPException(status_code=404, detail=errors.GAME_NOT_FOUND)


@game_router.post('/game/{game_id}/leave', status_code=200)
async def leave_game(body: player_schemas.PlayerId, game_id: str, db: SessionDep):
    player_id = get_active_player_id_from_game(db, body.playerId, game_id)

    rc = await handle_leave_game(player_id=player_id, db=db)

    if rc == 1:
        raise HTTPException(status_code=404, detail=errors.GAME_NOT_FOUND)
    elif rc == 2:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)


@game_router.websocket('/game/{game_id}')
async def game_websocket(
    game_id: str,
    player_id: str,
    ws: WebSocket,
    db: SessionDep,
):
    player_id = get_active_player_id_from_game(db, player_id, game_id)

    await game_manager.connect(ws, player_id)

    try:
        await game_manager.send_personal_message(
            player_id=player_id,
            message=await handle_gamestate(player_id=player_id, db=db),
        )

        while True:
            response = None
            received = await ws.receive_text()
            request = deserialize(received)

            response = (
                await message_handlers[request['type']](
                    db=db,
                    player_id=player_id,
                    data=received,
                )
                if request['type'] in message_handlers
                else error_message(detail=errors.INVALID_REQUEST)
            )

            if response is not None:
                await game_manager.send_personal_message(
                    player_id=player_id,
                    message=response,
                )

    except WebSocketDisconnect:
        game_manager.disconnect(player_id=player_id, websocket=ws)
        return


message_handlers = {
    'get-game-state': handle_gamestate,
    'end-turn': handle_end_turn,
    'use-movement-card': handle_movement_card,
    'cancel-movement': handle_cancel_movement,
    'use-shape-card': handle_shape_card,
}
