from contextlib import suppress

from sqlalchemy.orm import Session

from src.database.crud.crud_player import get_player
from src.database.crud.id_gen import create_uuid
from src.database.models import User
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
    return db.get(User, user_id)


def get_active_player_id_from_game(db: Session, user_id: str, game_id: str):
    user = get_user(db, user_id)
    for id in deserialize(user.active_players):
        player = get_player(db, id)
        if not player:
            continue
        if player.game_id == game_id:
            return id
    return None


def delete_active_player(db: Session, user_id: str, player_id: str):
    db_user = get_user(user_id=user_id, db=db)
    user_players = deserialize(db_user.active_players)

    with suppress(ValueError):
        user_players.remove(player_id)

    db_user.active_players = serialize(user_players)
    db.commit()
