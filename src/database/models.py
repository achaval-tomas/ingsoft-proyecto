from sqlalchemy import Column, ForeignKey, Integer, String
# from sqlalchemy.orm import relationship

from src.database.db import Base

class Player(Base):
    __tablename__ = "players"
    player_id = Column(String, primary_key=True)
    player_name = Column(String)

class Lobby(Base):
    __tablename__ = "lobbies"
    lobby_id = Column(String, primary_key=True)
    lobby_name = Column(String)
    lobby_owner = Column(String, ForeignKey("players.player_id"))
    min_players = Column(Integer)
    max_players = Column(Integer)
    players = Column(String)
    player_amount = Column(Integer)