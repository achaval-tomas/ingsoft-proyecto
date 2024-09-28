from sqlalchemy.orm import Session
from src.database import models, schemas
from uuid import uuid4
import json, random, jsonpickle
from src.database.cards.movement_card import MovementCard, MovementType
from src.database.cards.shape_card import ShapeCard, ShapeType

''' DATA HANDLE '''
def serialize (obj):
   return json.dumps(obj)

def deserialize (obj):
    return json.loads(obj)

''' READ METHODS '''
def get_player(db: Session, player_id: str):
    return db.query(models.Player).filter(models.Player.player_id == player_id).one_or_none()

def get_lobby(db: Session, lobby_id: str):
    return db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).one_or_none()

def get_lobby_list(db: Session, limit: int = 1000):
    return db.query(models.Lobby).all()

def get_game(db: Session, player_id: str):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return None
    return db.query(models.Game).filter(models.Game.game_id == player.game_id).one_or_none()

def get_game_players(db: Session, game_id: int):
    game = db.query(models.Game).filter(models.Game.game_id == game_id).one_or_none()
    if game is None:
        return []
    return deserialize(game.player_order)

def get_player_cards(db: Session, player_id: str):
    cards = db.query(models.PlayerCards).filter(models.PlayerCards.player_id == player_id).one_or_none()
    if not cards:
        return None
    return cards

''' WRITE METHODS '''
def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(player_name=player.player_name, player_id=str(uuid4()))
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player.player_id

def create_lobby(db: Session, lobby: schemas.LobbyCreate):
    player_list = [lobby.lobby_owner]
    db_lobby = models.Lobby(
        lobby_id=str(uuid4()),
        lobby_name=lobby.lobby_name,
        lobby_owner=lobby.lobby_owner,
        min_players=lobby.min_players,
        max_players=lobby.max_players,
        players=serialize(player_list),
        player_amount=1
    )
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby.lobby_id

def join_lobby(db:Session, lobby_id: str, player_id: str):
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        return False
    players = deserialize(lobby.players)
    players.append(player_id)
    lobby.players = serialize(players)
    lobby.player_amount += 1
    db.commit()
    return True

def create_game(db: Session, lobby_id: str):
    # obtain the lobby from where the game was started
    lobby: models.Lobby = get_lobby(db=db, lobby_id=lobby_id)
    if lobby is None:
        return False
    # deserialize players list
    deserialize(lobby.players)
    # create a list with the players in the lobby but randomly shuffled
    player_order = deserialize(lobby.players)
    random.shuffle(player_order)
    # the first turn will go to the first player in the shuffled list
    current_turn = 0
    # create the board (fundamental data for the creation of the game should be on the crud right?)
    colors = ["green", "blue", "yellow", "orange"]
    board = colors * 9
    # shuffle modificates the original list
    random.shuffle(board)
    # create game
    db_game = models.Game(
        player_order=serialize(player_order),
        current_turn=current_turn,
        board=serialize(board),
        blocked_color=None
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    game_id = db_game.game_id
    for id in player_order:
        player = get_player(db=db, player_id=id)
        if player is None:
            return False
        player.game_id = game_id
        db.commit()
        hand_cards(db=db, player_id=id)
    delete_lobby(db=db, lobby_id=lobby_id)
    return True

def hand_cards(db: Session, player_id: str):
    mov_cards = [
        MovementCard(mov_type=MovementType.STRAIGHT_ADJACENT),
        MovementCard(mov_type=MovementType.L_CCW),
        MovementCard(mov_type=MovementType.DIAGONAL_SPACED)
    ]
    shape_cards_hand = [
        ShapeCard(shape=ShapeType.SQUARE),
        ShapeCard(shape=ShapeType.T),
        ShapeCard(shape=ShapeType.LINE_5)
    ]
    shape_cards_deck = [ShapeCard(shape=ShapeType.SQUARE)]*10
    db_cards = models.PlayerCards(
        player_id = player_id,
        movement_cards = jsonpickle.dumps(mov_cards, unpicklable=False),
        shape_cards_in_hand = jsonpickle.dumps(shape_cards_hand, unpicklable=False),
        shape_cards_deck = jsonpickle.dumps(shape_cards_deck, unpicklable=False)
    )
    db.add(db_cards)
    db.commit()
    db.refresh(db_cards)

''' DELETE METHODS '''
def delete_player(db: Session, player_id: str):
    db.query(models.Player).filter(models.Player.player_id == player_id).delete()
    db.commit()

def delete_lobby(db: Session, lobby_id: str):
    db.query(models.Lobby).filter(models.Lobby.lobby_id == lobby_id).delete()
    db.commit()