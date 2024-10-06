from uuid import uuid4

from sqlalchemy.orm import Session

from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Lobby
from src.schemas.lobby_schemas import LobbyCreateSchema


def create_lobby(db: Session, lobby: LobbyCreateSchema):
    db_player = get_player(db=db, player_id=lobby.lobby_owner)
    if not db_player:
        return None
    player_list = [lobby.lobby_owner]
    db_lobby = Lobby(
        lobby_id=str(uuid4()),
        lobby_name=lobby.lobby_name,
        lobby_owner=lobby.lobby_owner,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
        players=serialize(player_list),
        player_amount=1,
    )
    db_player.lobby_id = db_lobby.lobby_id
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby.lobby_id


def join_lobby(db: Session, lobby_id: str, player_id: str):
    player = get_player(db, player_id)
    if not player:
        return 1
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return 2
    elif lobby.player_amount == lobby.max_players:
        return 3
    players = deserialize(lobby.players)
    if player_id in players:
        return 4
    assert not player.game_id
    assert not player.lobby_id
    player.lobby_id = lobby.lobby_id
    players.append(player_id)
    lobby.players = serialize(players)
    lobby.player_amount += 1
    db.commit()
    return 0


def leave_lobby(db: Session, player_id: str):
    player = get_player(db, player_id)
    if not player:
        return 1
    lobby = get_lobby(db=db, lobby_id=player.lobby_id)
    if not lobby:
        return 2
    player.lobby_id = None
    players = deserialize(lobby.players)
    if player_id == lobby.lobby_owner:
        return 3
    players.remove(player_id)
    lobby.players = serialize(players)
    lobby.player_amount -= 1
    db.commit()
    return 0


def get_lobby(db: Session, lobby_id: str):
    return db.query(Lobby).filter(Lobby.lobby_id == lobby_id).one_or_none()


def get_lobby_by_player_id(db: Session, player_id: str):
    player = get_player(player_id=player_id, db=db)
    if not player:
        return None
    return get_lobby(db=db, lobby_id=player.lobby_id)


def get_available_lobbies(db: Session, limit: int = 1000):
    return db.query(Lobby).filter(Lobby.player_amount < Lobby.max_players).all()


def delete_lobby(db: Session, lobby_id: str):
    query = db.query(Lobby).filter(Lobby.lobby_id == lobby_id)
    lobby = query.one_or_none()
    if not lobby:
        return
    for player_id in deserialize(lobby.players):
        db_player = get_player(db=db, player_id=player_id)
        if not db_player:
            continue
        db_player.lobby_id = None
        db.commit()
    query.delete()
    db.commit()
