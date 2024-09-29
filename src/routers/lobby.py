import json
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from src.database import models, schemas
from src.database.crud import crud_lobby
from src.database.session import get_db

create_lobby_router = APIRouter()

def lobby_decoder(lobby: models.Lobby):
    lobby.players = json.loads(lobby.players)
    return lobby

@create_lobby_router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    return {'lobby_id': crud_lobby.create_lobby(db=db, lobby=lobby)}

join_lobby_router = APIRouter(prefix = "/lobby")

@join_lobby_router.post("/join", status_code=202)
def join_lobby(body: schemas.LobbyJoin, db: Session = Depends(get_db)):
    res = crud_lobby.join_lobby(db = db, player_id = body.player_id, lobby_id = body.lobby_id)
    if res == 1:
        raise HTTPException(status_code=404, detail="Player not found")
    elif res == 2:
        raise HTTPException(status_code=404, detail="Lobby not found")
    elif res == 3:
        raise HTTPException(status_code=400, detail="Lobby is full")
    elif res == 4:
        raise HTTPException(status_code=400, detail="Already joined")

list_lobbies_router = APIRouter()

@list_lobbies_router.get("/lobby")
async def get_all_lobbies(db: Session = Depends(get_db)):
    return [lobby_decoder(l) for l in crud_lobby.get_available_lobbies(db=db)]
