from sqlalchemy import Column, ForeignKey, Integer, String

from src.database.db import Base


class User(Base):
    __tablename__ = 'users'
    user_id = Column(String, primary_key=True)
    user_name = Column(String)
    active_players = Column(String)


class Player(Base):
    __tablename__ = 'players'
    player_id = Column(String, primary_key=True)
    player_name = Column(String)
    lobby_id = Column(String, ForeignKey('lobbies.lobby_id'), nullable=True)
    game_id = Column(String, ForeignKey('games.game_id'), nullable=True)
    user_id = Column(String, ForeignKey('users.user_id'), nullable=True)


class Lobby(Base):
    __tablename__ = 'lobbies'
    lobby_id = Column(String, primary_key=True)
    lobby_name = Column(String)
    lobby_owner = Column(String, ForeignKey('players.player_id'))
    min_players = Column(Integer)
    max_players = Column(Integer)
    players = Column(String)
    player_amount = Column(Integer)
    password = Column(String, nullable=True)


class Game(Base):
    __tablename__ = 'games'
    game_id = Column(String, primary_key=True)
    game_name = Column(String)
    player_order = Column(String)
    current_turn = Column(Integer)
    turn_start = Column(String)
    board = Column(String)
    blocked_color = Column(String)
    temp_switches = Column(String)


class PlayerCards(Base):
    __tablename__ = 'player-cards'
    player_id = Column(String, ForeignKey('players.player_id'), primary_key=True)
    movement_cards = Column(String)
    shape_cards_in_hand = Column(String)
    shape_cards_deck = Column(String)
