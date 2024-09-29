from sqlalchemy.orm import Session
from src.database import schemas
from src.database.models import Lobby
from uuid import uuid4
from src.database.crud.tools.jsonify import serialize, deserialize
from src.database.crud.crud_player import get_player

def create_lobby(db: Session, lobby: schemas.LobbyCreate):
    player_list = [lobby.lobby_owner]
    db_lobby = Lobby(
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
    if not get_player(db, player_id):
        return 1
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return 2
    elif lobby.player_amount == lobby.max_players:
        return 3
    players = deserialize(lobby.players)
    if player_id in players:
        return 4
    players.append(player_id)
    lobby.players = serialize(players)
    lobby.player_amount += 1
    db.commit()
    return 0

def get_lobby(db: Session, lobby_id: str):
    return db.query(Lobby).filter(Lobby.lobby_id == lobby_id).one_or_none()

def get_available_lobbies(db: Session, limit: int = 1000):
    return db.query(Lobby).filter(Lobby.player_amount < Lobby.max_players).all()

def delete_lobby(db: Session, lobby_id: str):
    db.query(Lobby).filter(Lobby.lobby_id == lobby_id).delete()
    db.commit()