from sqlalchemy.orm import Session

import src.database.crud.crud_game as crud_game
from src.cards.card_dealer import MovCardDealer, ShapeCardDealer
from src.cards.card_utils import (
    coord_to_index,
    find_connected_tiles,
    match_shape_to_player_card,
)
from src.cards.movement_card import movement_data, rotate_movement
from src.database.crud.crud_player import get_player
from src.database.models import PlayerCards
from src.schemas.card_schemas import (
    UseMovementCardSchema,
    UseShapeCardSchema,
    dump_shape_cards,
    validate_shape_cards,
)
from src.tools.jsonify import deserialize, serialize


def get_player_cards(db: Session, player_id: str):
    return db.get(PlayerCards, player_id) if player_id else None


def hand_all_initial_cards(db: Session, players: list[str]):
    """
    Deals the initial shape and movement cards for
    every player in 'players' list.

    IMPORTANT: Player list must be previously validated.
    """
    shape_card_dealer = ShapeCardDealer(nplayers=len(players))

    for id in players:
        hand_initial_cards(
            db=db,
            player_id=id,
            shape_card_dealer=shape_card_dealer,
        )


def hand_initial_cards(
    db: Session,
    player_id: str,
    shape_card_dealer: ShapeCardDealer,
):
    mov_cards = MovCardDealer.deal_movement_cards(player_id=player_id)

    shape_cards_deck = shape_card_dealer.deal_shape_cards()

    db_cards = PlayerCards(
        player_id=player_id,
        movement_cards=serialize(mov_cards),
        shape_cards_in_hand=dump_shape_cards(shape_cards_deck[0:3]),
        shape_cards_deck=dump_shape_cards(shape_cards_deck[3:]),
    )

    db.add(db_cards)
    db.commit()
    db.refresh(db_cards)


def delete_player_cards(db: Session, player_id: str):
    cards = get_player_cards(db=db, player_id=player_id)
    if cards:
        db.delete(cards)
        db.commit()


def refill_cards(db: Session, player_id: str):
    """
    Refill cards for player_id, returns the
    new cards in hand for the player.

    Return format:
        rc, player_mov_cards, player_shape_cards

    Return codes:
        0 -> Player succesfully got cards refilled
        1 -> Player does not exist in the database
        2 -> Player is not currently in a game
        3 -> There is a winner (player_id) because he has no more cards available
    """
    player = get_player(db=db, player_id=player_id)
    if player is None:
        return 1, None, None

    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 2, None, None

    mov_cards = deserialize(player_cards.movement_cards)
    new_mov_cards = MovCardDealer.deal_movement_cards(player_id, 3 - len(mov_cards))
    mov_cards += new_mov_cards
    player_cards.movement_cards = serialize(mov_cards)
    db.commit()

    shape_cards_hand = validate_shape_cards(player_cards.shape_cards_in_hand)

    if any(
        c.isBlocked for c in shape_cards_hand
    ):  # There is a blocked card, shape refill not allowed.
        return 0, mov_cards, shape_cards_hand

    shape_cards_deck = validate_shape_cards(player_cards.shape_cards_deck)

    to_hand = 3 - len(shape_cards_hand)
    available = len(shape_cards_deck)

    if (to_hand == 3) and (available == 0):
        # case winner
        return 3, None, None

    new_shape_cards = shape_cards_deck[0:to_hand]
    shape_cards_hand += new_shape_cards
    shape_cards_deck = shape_cards_deck[to_hand:]

    player_cards.shape_cards_in_hand = dump_shape_cards(shape_cards_hand)
    player_cards.shape_cards_deck = dump_shape_cards(shape_cards_deck)
    db.commit()

    return 0, mov_cards, shape_cards_hand


def use_movement_card(db: Session, player_id: str, req: UseMovementCardSchema):
    player = get_player(player_id=player_id, db=db)
    if player is None:
        return 1

    game = crud_game.get_game_from_player(db=db, player_id=player_id)
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

    rc = crud_game.switch_tiles(db, game, req.position, target, clamp=movement.clamps)
    if rc == 1:
        return 6

    player_movement_cards.remove(req.movement)
    player_cards.movement_cards = serialize(player_movement_cards)

    temp_switches = deserialize(game.temp_switches)
    temp_switches.append((req.movement, req.position, req.rotation))
    game.temp_switches = serialize(temp_switches)

    db.commit()

    return 0


def cancel_movements(db: Session, player_id: str, nmovs: int = 3):
    """
    Cancels the last 'nmovs' movements made by the player
    during their current turn.

    Return codes:
        -1 -> no movements were cancelled.
        0 -> at least one movement was cancelled.
        1 -> internal server error.
        2 -> game not found.
        3 -> (should not happen) movement out of bounds.
    """
    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 1

    game = crud_game.get_game_from_player(db=db, player_id=player_id)
    if game is None:
        return 2

    player_order = deserialize(game.player_order)
    if player_id != player_order[game.current_turn]:
        return 3

    mov_cards = deserialize(player_cards.movement_cards)

    used_movements = deserialize(game.temp_switches)
    used_mov_count = len(used_movements)
    cancelled = False

    for m in range(min(nmovs, used_mov_count)):
        mov_name, position, rotation = used_movements[used_mov_count - m - 1]
        movement = movement_data[mov_name]
        target = rotate_movement(movement.target, rotation)

        rc = crud_game.switch_tiles(
            db=db,
            game=game,
            origin=position,
            target=target,
            clamp=movement.clamps,
        )

        if rc == 1:
            return 4

        mov_cards.append(mov_name)
        player_cards.movement_cards = serialize(mov_cards)

        used_movements.pop(used_mov_count - m - 1)
        game.temp_switches = serialize(used_movements)

        db.commit()

        cancelled = True

    if not cancelled:
        return -1

    return 0


def currently_used_movement_cards(db: Session, player_id: str):
    """
    Returns a list of all movement cards held by
    players who are in game with player @player_id
    """
    game = crud_game.get_game_from_player(db=db, player_id=player_id)

    cards = []
    for player in deserialize(game.player_order):
        p_cards = get_player_cards(db=db, player_id=player)
        if not p_cards:
            continue
        cards += deserialize(p_cards.movement_cards)

    return cards


def use_shape_card(
    db: Session,
    player_id: str,
    target_id: str,
    req: UseShapeCardSchema,
):
    player = get_player(player_id=target_id, db=db)
    if player is None:
        return 1

    game = crud_game.get_game_from_player(db=db, player_id=target_id)
    if game is None:
        return 2

    player_cards = get_player_cards(db=db, player_id=target_id)
    if player_cards is None:
        return 3

    player_order = deserialize(game.player_order)
    if player_order[game.current_turn] != player_id:
        return 4

    board = deserialize(game.board)
    shape_color = board[coord_to_index(req.position)]

    if shape_color == game.blocked_color:
        return 5

    shape = find_connected_tiles(board=board, start_coords=req.position)

    player_shape_cards = validate_shape_cards(player_cards.shape_cards_in_hand)

    if target_id == player_id and len(player_shape_cards) == 1:
        player_usable_shapes = player_shape_cards
    else:
        if target_id != player_id and any(s.isBlocked for s in player_shape_cards):
            return 6

        player_usable_shapes = [s for s in player_shape_cards if not s.isBlocked]

    matched_shape = match_shape_to_player_card(
        shape_cards=player_usable_shapes,
        target_shape=shape,
    )
    if not matched_shape:
        return 7

    if target_id == player_id:
        player_shape_cards.remove(matched_shape)
    else:
        matched_shape.isBlocked = True

    player_cards.shape_cards_in_hand = dump_shape_cards(player_shape_cards)
    game.blocked_color = shape_color
    db.commit()

    if not player_shape_cards and not deserialize(player_cards.shape_cards_deck):
        return 8

    if crud_game.confirm_movements(db=db, player_id=player_id) == 1:
        return 3

    return 0
