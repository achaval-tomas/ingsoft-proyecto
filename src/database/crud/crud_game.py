import random

from sqlalchemy.orm import Session

from src.database.cards.card_dealer import MovCardDealer, ShapeCardDealer
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Game, Lobby, PlayerCards


def create_game(db: Session, lobby_id: str, player_id: str):
    """
    Handles the initial setup of a game, including
    board randomization and handing cards.
    """
    # obtain the lobby from where the game was started
    lobby: Lobby = get_lobby(db=db, lobby_id=lobby_id)
    if lobby is None:
        return 1
    if lobby.lobby_owner != player_id:
        return 2

    # create a list with the players in the lobby but randomly shuffled
    player_order = deserialize(lobby.players)
    if len(player_order) < lobby.min_players:
        return 3
    random.shuffle(player_order)

    # the first turn will go to the first player in the shuffled list
    current_turn = 0

    # create the board
    colors = ['green', 'blue', 'yellow', 'red']
    board = colors * 9

    # randomize the board
    random.shuffle(board)

    # create game
    db_game = Game(
        player_order=serialize(player_order),
        current_turn=current_turn,
        board=serialize(board),
        blocked_color=None,
    )

    db.add(db_game)
    db.commit()
    db.refresh(db_game)

    game_id = db_game.game_id
    shape_card_dealer = ShapeCardDealer(nplayers=lobby.player_amount)
    for id in player_order:
        player = get_player(db=db, player_id=id)
        if player is None:
            return 4
        player.game_id = game_id
        db.commit()
        hand_initial_cards(db=db, player_id=id, shape_card_dealer=shape_card_dealer)

    return 0


def hand_initial_cards(db: Session, player_id: str, shape_card_dealer: ShapeCardDealer):
    mov_cards = MovCardDealer.deal_movement_cards()

    shape_cards_deck = shape_card_dealer.deal_shape_cards()

    shape_cards_hand = [c.model_dump_json() for c in shape_cards_deck[0:3]]
    shape_cards_deck = [c.model_dump_json() for c in shape_cards_deck[3:]]

    db_cards = PlayerCards(
        player_id=player_id,
        movement_cards=serialize(mov_cards),
        shape_cards_in_hand=serialize(shape_cards_hand),
        shape_cards_deck=serialize(shape_cards_deck),
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


def leave_game(db: Session, player_id: str):
    """
    Remove player_id from the game they're currently playing.

    Return format:
        code, winner_id | None
    Return codes:
        0 -> Player succesfully left the game
        1 -> Player is not currently in a game
        2 -> Player does not exist in the database
        3 -> There is a winner (winner_id) because everyone else left
    """
    game = get_game(db=db, player_id=player_id)
    if not game:
        return 1, None

    # Get player order array
    players = deserialize(game.player_order)

    # Get next player if player with current turn is leaving
    current_player = players[game.current_turn]
    current_turn = (
        (game.current_turn + 1) % len(players)
        if current_player == player_id
        else game.current_turn
    )
    new_current_player = players[current_turn]

    # Remove player from player order array
    players.remove(player_id)
    game.player_order = serialize(players)

    # Update current turn to match new_current_player
    game.current_turn = players.index(new_current_player)
    db.commit()

    player = get_player(db=db, player_id=player_id)
    if not player:
        return 2, None

    player.game_id = None
    db.commit()

    delete_player_cards(db=db, player_id=player_id)

    if len(players) == 1:
        return 3, players[0]

    return 0, None


def delete_game(db: Session, game_id: str):
    query = db.query(Game).filter(Game.game_id == game_id)
    game = query.one_or_none()
    if not game:
        return

    for player_id in deserialize(game.player_order):
        db_player = get_player(db=db, player_id=player_id)

        if not db_player:
            continue

        delete_player_cards(db=db, player_id=player_id)
        db_player.game_id = None
        db.commit()

    query.delete()
    db.commit()


def delete_player_cards(db: Session, player_id: str):
    db.query(PlayerCards).filter(PlayerCards.player_id == player_id).delete()
    db.commit()


def end_game_turn(db: Session, player_id: str):
    game = get_game(db=db, player_id=player_id)
    if not game:
        return 1

    player_order = deserialize(game.player_order)
    if player_id != player_order[game.current_turn]:
        return 2

    game.current_turn = (game.current_turn + 1) % len(player_order)
    db.commit()

    return 0
