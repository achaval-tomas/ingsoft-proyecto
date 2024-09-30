from fastapi import Depends, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.database import models, schemas
from src.database.crud import crud_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize
from src.database.session import get_db
from src.routers.handlers.ws_handle_leave_lobby import ws_handle_leave_lobby
from src.routers.handlers.ws_share_player_list import ws_share_player_list
from src.routers.helpers.connection_manager import lobby_manager
from src.routers.handlers.ws_handle_lobbystate import ws_handle_lobbystate


def lobby_decoder(lobby: models.Lobby):
    lobby.players = deserialize(lobby.players)
    return lobby


lobby_router = APIRouter()


@lobby_router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    return {'lobby_id': crud_lobby.create_lobby(db=db, lobby=lobby)}


@lobby_router.post("/lobby/join", status_code=202)
async def join_lobby(body: schemas.LobbyJoin, db: Session = Depends(get_db)):
    res = crud_lobby.join_lobby(db = db, player_id = body.player_id, lobby_id = body.lobby_id)
    if res == 1:
        raise HTTPException(status_code=404, detail="Player not found")
    elif res == 2:
        raise HTTPException(status_code=404, detail="Lobby not found")
    elif res == 3:
        raise HTTPException(status_code=400, detail="Lobby is full")
    elif res == 4:
        raise HTTPException(status_code=400, detail="Already joined")
    await ws_share_player_list(player_id=body.player_id, lobby_id=body.lobby_id, db=db, broadcast=True)


@lobby_router.get("/lobby")
async def get_all_lobbies(db: Session = Depends(get_db)):
    return [lobby_decoder(l) for l in crud_lobby.get_available_lobbies(db=db)]


@lobby_router.post("/lobby/leave", status_code=200)
async def leave_lobby(body: schemas.LobbyJoin, db: Session = Depends(get_db)):
    res = await ws_handle_leave_lobby(db = db, player_id = body.player_id, lobby_id=body.lobby_id)
    if res == 1:
        raise HTTPException(status_code=404, detail="Player not found")
    elif res == 2:
        raise HTTPException(status_code=404, detail="Lobby not found")


@lobby_router.websocket("/lobby/{player_id}")
async def lobby_websocket(player_id: str, ws: WebSocket, db: Session = Depends(get_db)):
    player = get_player(db=db, player_id=player_id)
    assert player != None
    await lobby_manager.connect(ws, player_id)
    try:
        await ws_share_player_list(player_id=player_id, lobby_id=player.lobby_id, db=db, broadcast=False)
        while True:
            response = ""
            received = await ws.receive_text()
            request = deserialize(received)
            match request['type']:
                case 'get-lobby-state':
                    response = await ws_handle_lobbystate(player_id, db)

            if response != "":
                await lobby_manager.send_personal_message(response, player_id)

    except WebSocketDisconnect:
        lobby_manager.disconnect(player_id=player_id)
        return
