import random
import jsonpickle
from sqlalchemy.orm import Session
from src.database.models import *
from src.database.cards.movement_card import MovementCard, MovementType
from src.database.cards.shape_card import ShapeCard, ShapeType
from src.database.crud.crud_lobby import get_lobby, delete_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize, deserialize
from src.routers.handlers.ws_handle_announce_winner import ws_handle_announce_winner

def create_game(db: Session, lobby_id: str, player_id: str):
    # obtain the lobby from where the game was started
    lobby: Lobby = get_lobby(db=db, lobby_id=lobby_id)
    if lobby is None:
        return 2
    if lobby.lobby_owner != player_id:
        return 1
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
    db_game = Game(
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
        player.lobby_id = None
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
    db_cards = PlayerCards(
        player_id = player_id,
        movement_cards = jsonpickle.dumps(mov_cards, unpicklable=False),
        shape_cards_in_hand = jsonpickle.dumps(shape_cards_hand, unpicklable=False),
        shape_cards_deck = jsonpickle.dumps(shape_cards_deck, unpicklable=False)
    )
    db.add(db_cards)
    db.commit()
    db.refresh(db_cards)

def get_game(db: Session, player_id: str):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return None
    return db.query(Game).filter(Game.game_id == player.game_id).one_or_none()

def get_game_players(db: Session, game_id: int):
    game = db.query(Game).filter(Game.game_id == game_id).one_or_none()
    if game is None:
        return []
    return deserialize(game.player_order)

async def leave_game(db: Session, player_id: str):
    game = get_game(db=db, player_id=player_id)
    players = deserialize(game.player_order)
    players.remove(player_id)
    game.player_order = serialize(players)
    if len(players) == 1:
        await ws_handle_announce_winner()
    db.commit()