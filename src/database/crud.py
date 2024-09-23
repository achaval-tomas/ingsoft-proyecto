from sqlalchemy.orm import Session
from src.database import models, schemas
import random

# TO-DO: Unique ID generation

''' READING METHODS '''
def get_player(db: Session, player_id: str):
    return db.query(models.Player).filter(models.Player.player_id == player_id)

def get_lobby(db: Session, lobby_id: str):
    return db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id)

def get_lobby_list(db: Session, limit: int = 1000):
    return db.query(models.Lobby).all()

''' WRITING METHODS '''
def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(player_name=player.player_name, player_id='1234')
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id

def create_lobby(db: Session, lobby: schemas.LobbyCreate):
    db_lobby = models.Lobby(lobby_id=str(int(random.random()*1000)),
                            lobby_name=lobby.lobby_name,
                            lobby_owner=lobby.lobby_owner,
                            min_players=lobby.min_players,
                            max_players=lobby.max_players,
                            )
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby.lobby_id

''' DELETING METHODS '''
def delete_player(db: Session, player_id: str):
    db.query(models.Player).filter(models.Player.player_id == player_id).delete()
    db.commit()

def delete_lobby(db: Session, lobby_id: str):
    db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).delete()
    db.commit()