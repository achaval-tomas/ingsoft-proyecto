from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from src.database import schemas, crud
from src.database.session import get_db

create_lobby_router = APIRouter()

@create_lobby_router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    return {'lobby_id': crud.create_lobby(db=db, lobby=lobby)}


join_lobby_router = APIRouter(prefix = "/lobby")

@join_lobby_router.post("/join", status_code=202)
def join_lobby(body: schemas.LobbyJoin, db: Session = Depends(get_db)):
    res = crud.join_lobby(db = db, player_id = body.player_id, lobby_id = body.lobby_id)
    if not res:
        raise HTTPException(status_code=404, detail="Lobby not found")
