from sqlalchemy.orm import Session

from src.database.crud.crud_user import create_player, get_player, get_user
from src.database.crud.id_gen import create_uuid
from src.database.models import Lobby
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.schemas.player_schemas import PlayerCreateSchema
from src.tools.jsonify import deserialize, serialize


def create_lobby(db: Session, lobby: LobbyCreateSchema):
    user = get_user(db=db, user_id=lobby.lobby_owner)
    if not user:
        return 1

    player = create_player(
        db=db,
        user_id=lobby.lobby_owner,
        player=PlayerCreateSchema(
            player_name=user.user_name,
        ),
    )

    player_list = [player.player_id]

    db_lobby = Lobby(
        lobby_id=create_uuid(),
        lobby_name=lobby.lobby_name,
        lobby_owner=lobby.lobby_owner,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
        players=serialize(player_list),
        player_amount=1,
    )

    player.lobby_id = db_lobby.lobby_id

    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)

    return db_lobby.lobby_id


def join_lobby(db: Session, lobby_id: str, player_id: str):
    user = get_user(db, player_id)
    if not user:
        return 1

    user_players = [get_player(db, id) for id in deserialize(user.active_players)]
    if any(p.lobby_id == lobby_id for p in user_players if p is not None):
        return 2

    player = create_player(
        db=db,
        user_id=player_id,
        player=PlayerCreateSchema(
            player_name=user.user_name,
        ),
    )

    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return 3
    elif lobby.player_amount == lobby.max_players:
        return 4

    player.lobby_id = lobby.lobby_id

    players = deserialize(lobby.players)
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
    player = get_player(player_id=player_id, db=db)
    if not player or not player.lobby_id:
        return None
    return get_lobby(db=db, lobby_id=player.lobby_id)


def get_available_lobbies(db: Session, limit: int = 1000):
    return db.query(Lobby).filter(Lobby.player_amount < Lobby.max_players).all()


def delete_lobby(db: Session, lobby_id: str):
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return

    for player_id in deserialize(lobby.players):
        db_player = get_player(db=db, player_id=player_id)
        if not db_player:
            continue
        db_player.lobby_id = None
        db.commit()

    db.delete(lobby)
    db.commit()
