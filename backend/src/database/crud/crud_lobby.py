from sqlalchemy.orm import Session

from src.database.crud import crud_user
from src.database.crud.id_gen import create_uuid
from src.database.models import Lobby
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.tools.jsonify import deserialize, serialize


def create_lobby(db: Session, lobby: LobbyCreateSchema):
    user = crud_user.get_user(db=db, user_id=lobby.lobby_owner)
    if not user:
        return 1

    player = crud_user.create_player(db=db, user_id=lobby.lobby_owner)
    if not player:
        return 2

    player_list = [player.player_id]

    db_lobby = Lobby(
        lobby_id=create_uuid(),
        lobby_name=lobby.lobby_name,
        lobby_owner=player.player_id,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
        players=serialize(player_list),
        player_amount=1,
        password=lobby.password,
    )

    player.lobby_id = db_lobby.lobby_id

    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)

    return db_lobby.lobby_id


def join_lobby(db: Session, lobby_id: str, player_id: str, pw: str):
    user = crud_user.get_user(db, player_id)
    if not user:
        return 1

    user_players = [
        crud_user.get_player(db, id) for id in deserialize(user.active_players)
    ]
    if any(p.lobby_id == lobby_id for p in user_players if p is not None):
        return 2

    player = crud_user.create_player(db=db, user_id=player_id)

    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return 3
    elif lobby.player_amount == lobby.max_players:
        return 4
    elif lobby.password != '' and pw != lobby.password:
        return 5

    player.lobby_id = lobby.lobby_id

    players = deserialize(lobby.players)
    players.append(player.player_id)
    lobby.players = serialize(players)
    lobby.player_amount += 1

    db.commit()

    return 0


def leave_lobby(db: Session, player_id: str):
    player = crud_user.get_player(db, player_id)
    if not player:
        return 1

    lobby = get_lobby(db=db, lobby_id=player.lobby_id)
    if not lobby:
        return 2

    if player_id == lobby.lobby_owner:
        return 3

    player.lobby_id = None

    players = deserialize(lobby.players)
    players.remove(player_id)
    lobby.players = serialize(players)

    lobby.player_amount -= 1

    db.commit()

    return 0


def get_lobby(db: Session, lobby_id: str):
    return db.get(Lobby, lobby_id) if lobby_id else None


def get_lobby_by_player_id(db: Session, player_id: str):
    player = crud_user.get_player(player_id=player_id, db=db)
    if not player or not player.lobby_id:
        return None
    return get_lobby(db=db, lobby_id=player.lobby_id)


def get_lobbies(db: Session, limit: int = 1000):
    return db.query(Lobby).all()


def delete_lobby(db: Session, lobby_id: str, clear: bool = False):
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return

    for player_id in deserialize(lobby.players):
        db_player = crud_user.get_player(db=db, player_id=player_id)
        if not db_player:
            continue
        db_player.lobby_id = None
        if clear:
            crud_user.delete_active_player(db, db_player.user_id, player_id)
        db.commit()

    db.delete(lobby)
    db.commit()
