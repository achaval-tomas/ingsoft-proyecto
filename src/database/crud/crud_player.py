from sqlalchemy.orm import Session

from src.database import models
from src.database.crud.id_gen import create_uuid
from src.schemas.player_schemas import PlayerCreateSchema


def create_player(db: Session, player: PlayerCreateSchema):
    db_player = models.Player(player_name=player.player_name, player_id=create_uuid())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id


def get_player(db: Session, player_id: str):
    return (
        db.query(models.Player)
        .filter(models.Player.player_id == player_id)
        .one_or_none()
    )


def delete_player(db: Session, player_id: str):
    db.query(models.Player).filter(models.Player.player_id == player_id).delete()
    db.commit()
