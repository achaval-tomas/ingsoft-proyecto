from sqlalchemy.orm import Session
from src.database import models, schemas
from uuid import uuid4

def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(player_name=player.player_name, player_id=str(uuid4()))
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id

def get_player(db: Session, player_id: str):
    return db.query(models.Player).filter(models.Player.player_id == player_id).one_or_none()

def get_player_cards(db: Session, player_id: str):
    cards = db.query(models.PlayerCards).filter(models.PlayerCards.player_id == player_id).one_or_none()
    if not cards:
        return None
    return cards

def delete_player(db: Session, player_id: str):
    db.query(models.Player).filter(models.Player.player_id == player_id).delete()
    db.commit()