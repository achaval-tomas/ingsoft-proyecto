from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from src.constants import errors
from src.database import models
from src.database.crud import crud_lobby
from src.database.crud.crud_user import get_active_player_id_from_lobby, get_player
from src.database.db import SessionDep
from src.routers.handlers.lobby.leave_lobby import handle_leave_lobby
from src.routers.handlers.lobby.lobbystate import handle_lobbystate
from src.routers.handlers.lobby.player_list import share_player_list
from src.routers.helpers.connection_manager import lobby_manager
from src.schemas.lobby_schemas import (
    LobbyCreateSchema,
    LobbyIdSchema,
    LobbyJoinSchema,
    LobbyLeaveSchema,
    LobbySchema,
)
from src.schemas.message_schema import error_message
from src.tools.jsonify import deserialize


def lobby_decoder(lobby: models.Lobby):
    return LobbySchema(
        lobby_id=lobby.lobby_id,
        lobby_name=lobby.lobby_name,
        lobby_owner=lobby.lobby_owner,
        players=deserialize(lobby.players),
        player_amount=lobby.player_amount,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
    )


lobby_router = APIRouter()


@lobby_router.post('/lobby', response_model=LobbyIdSchema)
def create_lobby(lobby: LobbyCreateSchema, db: SessionDep):
    res = crud_lobby.create_lobby(db=db, lobby=lobby)

    if res == 1:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)

    return LobbyIdSchema(lobby_id=res)


@lobby_router.post('/lobby/join', status_code=202)
async def join_lobby(body: LobbyJoinSchema, db: SessionDep):
    res = crud_lobby.join_lobby(db=db, player_id=body.player_id, lobby_id=body.lobby_id)

    if res == 1:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)
    elif res == 2:
        raise HTTPException(status_code=400, detail=errors.ALREADY_JOINED)
    elif res == 3:
        raise HTTPException(status_code=404, detail=errors.LOBBY_NOT_FOUND)
    elif res == 4:
        raise HTTPException(status_code=400, detail=errors.LOBBY_IS_FULL)

    player_id = get_active_player_id_from_lobby(db, body.player_id, body.lobby_id)
    await share_player_list(
        player_id=player_id,
        lobby_id=body.lobby_id,
        db=db,
        broadcast=True,
    )


@lobby_router.get('/lobby', response_model=list[LobbySchema])
async def get_all_lobbies(db: SessionDep):
    return [lobby_decoder(lobby) for lobby in crud_lobby.get_available_lobbies(db=db)]


@lobby_router.post('/lobby/leave', status_code=200)
async def leave_lobby(body: LobbyLeaveSchema, db: SessionDep):
    res = await handle_leave_lobby(
        db=db,
        player_id=body.player_id,
        lobby_id=body.lobby_id,
    )

    if res == 1:
        raise HTTPException(status_code=404, detail=errors.PLAYER_NOT_FOUND)
    elif res == 2:
        raise HTTPException(status_code=404, detail=errors.LOBBY_NOT_FOUND)


@lobby_router.websocket('/lobby/{player_id}')
async def lobby_websocket(
    player_id: str,
    ws: WebSocket,
    db: SessionDep,
):
    player = get_player(db=db, player_id=player_id)
    assert player is not None

    await lobby_manager.connect(ws, player_id)

    try:
        await share_player_list(
            player_id=player_id,
            lobby_id=player.lobby_id,
            db=db,
            broadcast=False,
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
                await lobby_manager.send_personal_message(response, player_id)

    except WebSocketDisconnect:
        lobby_manager.disconnect(player_id=player_id, websocket=ws)
        return


message_handlers = {
    'get-lobby-state': handle_lobbystate,
}
