from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from src.constants import errors
from src.database.db import SessionDep
from src.routers.handlers.game.cancel_movements import handle_cancel_movements
from src.routers.handlers.game.end_turn import handle_endturn
from src.routers.handlers.game.gamestate import handle_gamestate
from src.routers.handlers.game.leave_game import handle_leave_game
from src.routers.handlers.game.movement_card import handle_movement_card
from src.routers.handlers.game.shape_card import handle_shape_card
from src.routers.handlers.lobby.game_start import handle_game_start
from src.routers.helpers.connection_manager import game_manager
from src.schemas import game_schemas, player_schemas
from src.tools.jsonify import deserialize

game_router = APIRouter()


@game_router.post('/game', status_code=200)
async def start_game(body: game_schemas.GameCreate, db: SessionDep):
    rc = await handle_game_start(
        db=db,
        player_id=body.player_id,
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


@game_router.post('/game/leave', status_code=200)
async def leave_game(body: player_schemas.PlayerId, db: SessionDep):
    res = await handle_leave_game(player_id=body.playerId, db=db)

    if res == 1:
        raise HTTPException(status_code=404, detail=errors.GAME_NOT_FOUND)
    elif res == 2:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)


@game_router.websocket('/game/{player_id}')
async def game_websocket(
    player_id: str,
    ws: WebSocket,
    db: SessionDep,
):
    await game_manager.connect(ws, player_id)

    try:
        await game_manager.send_personal_message(
            player_id=player_id,
            message=handle_gamestate(player_id=player_id, db=db),
        )

        while True:
            response = None
            received = await ws.receive_text()
            request = deserialize(received)

            match request['type']:
                case 'get-game-state':
                    response = handle_gamestate(player_id=player_id, db=db)
                case 'end-turn':
                    response = await handle_endturn(player_id=player_id, db=db)
                case 'use-movement-card':
                    response = await handle_movement_card(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )
                case 'cancel-movements':
                    response = await handle_cancel_movements(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )
                case 'use-shape-card':
                    response = await handle_shape_card(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )

            if response is not None:
                await game_manager.send_personal_message(
                    player_id=player_id,
                    message=response,
                )

    except WebSocketDisconnect:
        game_manager.disconnect(player_id=player_id)
        return
