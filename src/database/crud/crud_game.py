import random

from sqlalchemy.orm import Session

from src.database.cards.card_dealer import MovCardDealer, ShapeCardDealer
from src.database.cards.movement_card import movement_data, rotate_movement
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_player import get_player, get_player_cards
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Game, Lobby, PlayerCards
from src.schemas.card_schemas import ShapeCardSchema, UseMovementCardSchema


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


def refill_cards(db: Session, player_id: str):
    """
    Refill cards for player_id

    Return codes:
        0 -> Player succesfully got cards refilled
        1 -> Player does not exist in the database
        2 -> Player is not currently in a game
        3 -> There is a winner (player_id) because he has no more cards available
    """
    player = get_player(db=db, player_id=player_id)
    if player is None:
        return 1

    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 2

    # Get player movement cards array
    mov_cards = deserialize(player_cards.movement_cards)
    new_mov_cards = MovCardDealer.deal_movement_cards(3 - len(mov_cards))
    mov_cards += new_mov_cards

    player_cards.movement_cards = serialize(mov_cards)
    db.commit()

    # Get player shape cards in hand array
    shape_cards_hand = deserialize(player_cards.shape_cards_in_hand)
    for c in shape_cards_hand:
        card = ShapeCardSchema.model_validate_json(c)
        if card.isBlocked:
            # case no handing cards because of blocked card
            return 0

    # Get player shape cards deck array
    shape_cards_deck = deserialize(player_cards.shape_cards_deck)

    to_hand = 3 - len(shape_cards_hand)
    available = len(shape_cards_deck)

    if (to_hand == 3) and (available == 0):
        # case winner
        return 3

    new_shape_cards = shape_cards_deck[0:to_hand]
    shape_cards_hand += new_shape_cards
    shape_cards_deck = shape_cards_deck[to_hand:]

    # Update player cards
    player_cards.shape_cards_in_hand = serialize(shape_cards_hand)
    player_cards.shape_cards_deck = serialize(shape_cards_deck)
    db.commit()

    return 0


def use_movement_card(db: Session, player_id: str, req: UseMovementCardSchema):
    player = get_player(player_id=player_id, db=db)
    if player is None:
        return 1

    game = get_game(db=db, game_id=player.game_id)
    if game is None:
        return 2

    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 3

    player_movement_cards = deserialize(player_cards.movement_cards)
    if req.movement not in player_movement_cards:
        return 4

    player_order = deserialize(game.player_order)
    if player_order[game.current_turn] != player_id:
        return 5

    movement = movement_data[req.movement]
    target = rotate_movement(movement.target, req.rotation)

    rc = swap_tiles(game, req.position, target, clamp=movement.clamps)
    if rc == 1:
        return 6

    player_movement_cards.remove(req.movement)
    player_cards.movement_cards = serialize(player_movement_cards)
    db.commit()

    return 0


def swap_tiles(
    db: Session,
    game: Game,
    origin: tuple[int, int],
    target: tuple[int, int],
    clamp: bool,
):
    board_origin = origin[1] * 6 + origin[0]
    if not 0 <= board_origin < 36:
        return 1

    target_x = origin[0] + target[0]
    target_y = origin[1] + target[1]

    if clamp:
        target_x = clamp_val_to_board_range(target_x)
        target_y = clamp_val_to_board_range(target_y)

    board_target = target_y * 6 + target_x

    if not 0 <= board_target < 36:
        return 1

    board = deserialize(game.board)
    board[board_origin], board[board_target] = board[board_target], board[board_origin]

    game.board = serialize(board)
    db.commit()

    return 0


def clamp_val_to_board_range(val: int):
    return 0 if val < 0 else (5 if val > 5 else val)


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

    refill_cards(db=db, player_id=player_id)

    game.current_turn = (game.current_turn + 1) % len(player_order)
    db.commit()

    return 0
