from contextlib import suppress

from sqlalchemy.orm import Session

from src.database.crud.crud_game import get_game_from_player
from src.database.crud.id_gen import create_uuid
from src.database.models import Game, Player, User
from src.schemas.player_schemas import PlayerCreateSchema
from src.tools.jsonify import deserialize, serialize


def create_user(db: Session, user: PlayerCreateSchema):
    db_user = User(
        user_name=user.player_name,
        user_id=create_uuid(),
        active_players=serialize([]),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user.user_id


def get_user(db: Session, user_id: str):
    return db.get(User, user_id) if user_id else None


def get_active_player_games(db: Session, user_id: str):
    games: list[Game] = []
    user = get_user(db, user_id)
    if not user:
        return games

    for id in deserialize(user.active_players):
        game = get_game_from_player(db, id)
        if game:
            games.append(game)

    return games


def get_active_player_id_from_game(db: Session, user_id: str, game_id: str):
    user = get_user(db, user_id)
    if not user:
        return None
    for id in deserialize(user.active_players):
        player = get_player(db, id)
        if not player:
            continue
        if player.game_id == game_id:
            return id
    return None


def get_active_player_id_from_lobby(db: Session, user_id: str, lobby_id: str):
    user = get_user(db, user_id)
    if not user:
        return None

    for id in deserialize(user.active_players):
        player = get_player(db, id)
        if not player:
            continue
        if player.lobby_id == lobby_id:
            return id
    return None


def delete_active_player(db: Session, user_id: str, player_id: str):
    db_user = get_user(user_id=user_id, db=db)
    if not db_user:
        return

    user_players = deserialize(db_user.active_players)

    with suppress(ValueError):
        user_players.remove(player_id)

    player = get_player(db, player_id)
    if player:
        db.delete(player)

    db_user.active_players = serialize(user_players)
    db.commit()


def create_player(db: Session, user_id: str):
    db_user = get_user(user_id=user_id, db=db)
    if not db_user:
        return None

    db_player = Player(player_name=db_user.user_name, player_id=create_uuid())
    db.add(db_player)

    user_players = deserialize(db_user.active_players)
    user_players.append(db_player.player_id)
    db_user.active_players = serialize(user_players)

    db.commit()
    db.refresh(db_player)
    return db_player


def get_player(db: Session, player_id: str):
    return db.get(Player, player_id) if player_id else None


def decode_player_id(db: Session, player_id: str, user_id: str):
    db_user = get_user(user_id=user_id, db=db)
    if not db_user:
        return None

    if player_id in deserialize(db_user.active_players):
        return user_id

    return player_id
