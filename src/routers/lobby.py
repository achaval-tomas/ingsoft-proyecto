from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from src.database import schemas, crud
from src.database.session import get_db

create_lobby_router = APIRouter()

@create_lobby_router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    return {'lobby_id': crud.create_lobby(db=db, lobby=lobby)}
