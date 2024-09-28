from fastapi import Depends, WebSocketException
from src.database.models import Lobby
from src.database.crud import create_game
from sqlalchemy.orm import Session
import json

def start_game(player_id: str, db: Session):
    lobby: Lobby = db.query(Lobby).filter(Lobby.lobby_owner==player_id).one_or_none()
    if lobby is None:
        return json.dumps({"status": 404, "message": "Lobby not found."})
    lobby_id = lobby.lobby_id
    create_game(db=db, lobby_id=lobby_id)
    return json.dumps({"status": 201, "message": "Game created."})

