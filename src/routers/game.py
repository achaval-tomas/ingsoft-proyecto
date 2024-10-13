from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.constants import errors
from src.database.session import get_db
from src.routers.handlers.ws_handle_cancel_movements import ws_handle_cancel_movements
from src.routers.handlers.ws_handle_endturn import ws_handle_endturn
from src.routers.handlers.ws_handle_game_start import ws_handle_game_start
from src.routers.handlers.ws_handle_gamestate import ws_handle_gamestate
from src.routers.handlers.ws_handle_leave_game import ws_handle_leave_game
from src.routers.handlers.ws_handle_movement_card import ws_handle_movement_card
from src.routers.handlers.ws_handle_shape_card import ws_handle_shape_card
from src.schemas import game_schemas, player_schemas
from src.tools.jsonify import deserialize

game_router = APIRouter()


@game_router.post('/game', status_code=200)
async def start_game(body: game_schemas.GameCreate, db: Session = Depends(get_db)):
    rc = await ws_handle_game_start(
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
async def leave_game(body: player_schemas.PlayerId, db: Session = Depends(get_db)):
    res = await ws_handle_leave_game(player_id=body.playerId, db=db)

    if res == 1:
        raise HTTPException(status_code=404, detail=errors.GAME_NOT_FOUND)
    elif res == 2:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)


@game_router.websocket('/game/{player_id}')
async def game_websocket(player_id: str, ws: WebSocket, db: Session = Depends(get_db)):
    await cm.game_manager.connect(ws, player_id)

    try:
        await cm.game_manager.send_personal_message(
            player_id=player_id,
            message=ws_handle_gamestate(player_id=player_id, db=db),
        )

        while True:
            response = None
            received = await ws.receive_text()
            request = deserialize(received)

            match request['type']:
                case 'get-game-state':
                    response = ws_handle_gamestate(player_id=player_id, db=db)
                case 'end-turn':
                    response = await ws_handle_endturn(player_id=player_id, db=db)
                case 'use-movement-card':
                    response = await ws_handle_movement_card(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )
                case 'cancel-movements':
                    response = await ws_handle_cancel_movements(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )
                case 'use-shape-card':
                    response = await ws_handle_shape_card(
                        player_id=player_id,
                        db=db,
                        data=received,
                    )

            if response is not None:
                await cm.game_manager.send_personal_message(
                    player_id=player_id,
                    message=response,
                )

    except WebSocketDisconnect:
        cm.game_manager.disconnect(player_id=player_id)
        return
