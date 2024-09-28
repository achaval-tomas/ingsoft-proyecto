from sqlalchemy.orm import Session
from src.database import models, schemas
from uuid import uuid4
from src.database.crud.tools.jsonify import serialize, deserialize

def create_lobby(db: Session, lobby: schemas.LobbyCreate):
    player_list = [lobby.lobby_owner]
    db_lobby = models.Lobby(
        lobby_id=str(uuid4()),
        lobby_name=lobby.lobby_name,
        lobby_owner=lobby.lobby_owner,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
        players=serialize(player_list),
        player_amount=1
    )
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby.lobby_id

def join_lobby(db:Session, lobby_id: str, player_id: str):
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return False
    players = deserialize(lobby.players)
    players.append(player_id)
    lobby.players = serialize(players)
    lobby.player_amount += 1
    db.commit()
    return True

def get_lobby(db: Session, lobby_id: str):
    return db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).one_or_none()

def get_lobby_list(db: Session, limit: int = 1000):
    return db.query(models.Lobby).all()

def delete_lobby(db: Session, lobby_id: str):
    db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).delete()
    db.commit()