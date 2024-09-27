from sqlalchemy.orm import Session
from src.database import models, schemas
from uuid import uuid4
import json

''' READ METHODS '''
def get_player(db: Session, player_id: str):
    return db.query(models.Player).filter(models.Player.player_id == player_id).one_or_none()

def get_lobby(db: Session, lobby_id: str):
    return db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).one_or_none()

def get_lobby_list(db: Session, limit: int = 1000):
    return db.query(models.Lobby).all()

''' WRITE METHODS '''
def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(player_name=player.player_name, player_id=str(uuid4()))
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id

def create_lobby(db: Session, lobby: schemas.LobbyCreate):
    player_list = [lobby.lobby_owner]
    db_lobby = models.Lobby(lobby_id=str(uuid4()),
                            lobby_name=lobby.lobby_name,
                            lobby_owner=lobby.lobby_owner,
                            min_players=lobby.min_players,
                            max_players=lobby.max_players,
                            players=json.dumps(player_list),
                            player_amount=1,
                            )
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby.lobby_id

def join_lobby(db: Session, player_id: str, lobby_id: str):
    db_lobby = get_lobby(db = db, lobby_id=lobby_id)
    players = json.loads(db_lobby.players)
    players.append(player_id)
    db_lobby.players = json.dumps(players)
    db.commit()

''' DELETE METHODS '''
def delete_player(db: Session, player_id: str):
    db.query(models.Player).filter(models.Player.player_id == player_id).delete()
    db.commit()

def delete_lobby(db: Session, lobby_id: str):
    db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).delete()
    db.commit()