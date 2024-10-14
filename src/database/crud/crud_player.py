from sqlalchemy.orm import Session

from src.database.crud.id_gen import create_uuid
from src.database.models import Player
from src.schemas.player_schemas import PlayerCreateSchema


def create_player(db: Session, player: PlayerCreateSchema):
    db_player = Player(player_name=player.player_name, player_id=create_uuid())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id


def get_player(db: Session, player_id: str):
    return db.get(Player, player_id) if player_id else None


def delete_player(db: Session, player_id: str):
    player = get_player(db, player_id)
    if player:
        db.delete(player)
        db.commit()
