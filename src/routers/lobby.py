from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from src.database import schemas, crud
from src.database.session import get_db
from pydantic import BaseModel

create_lobby_router = APIRouter()

@create_lobby_router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    return {'lobby_id': crud.create_lobby(db=db, lobby=lobby)}


class LobbyJoin(BaseModel):
    player_id: str
    lobby_id: str

join_lobby_router = APIRouter(prefix = "/lobby")

@join_lobby_router.post("/{lobby_id}/join")
def join_lobby(body: LobbyJoin, db: Session = Depends(get_db)):
    crud.join_lobby(db = db, player_id = body.player_id, lobby_id = body.lobby_id)

