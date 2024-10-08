from sqlalchemy.orm import Session

import src.database.cards.card_dealer as cd
import src.database.crud.crud_game as crud_game
from src.database.cards.movement_card import movement_data, rotate_movement
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import PlayerCards
from src.schemas.card_schemas import ShapeCardSchema, UseMovementCardSchema


def get_player_cards(db: Session, player_id: str):
    return (
        db.query(PlayerCards).filter(PlayerCards.player_id == player_id).one_or_none()
    )


def hand_all_initial_cards(db: Session, players: list[str]):
    """Player list must be previously validated"""
    shape_card_dealer = cd.ShapeCardDealer(nplayers=len(players))
    for id in players:
        hand_initial_cards(
            db=db,
            player_id=id,
            shape_card_dealer=shape_card_dealer,
        )


def hand_initial_cards(
    db: Session,
    player_id: str,
    shape_card_dealer: cd.ShapeCardDealer,
):
    mov_cards = cd.MovCardDealer.deal_movement_cards(player_id=player_id)

    shape_cards_deck = shape_card_dealer.deal_shape_cards()

    shape_cards_hand = [c.model_dump_json() for c in shape_cards_deck[0:3]]
    shape_cards_deck = [c.model_dump_json() for c in shape_cards_deck[3:]]

    db_cards = PlayerCards(
        player_id=player_id,
        movement_cards=serialize(mov_cards),
        shape_cards_in_hand=serialize(shape_cards_hand),
        shape_cards_deck=serialize(shape_cards_deck),
        temp_swaps_performed=serialize([]),
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
    new_mov_cards = cd.MovCardDealer.deal_movement_cards(player_id, 3 - len(mov_cards))
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

    game = crud_game.get_game(db=db, player_id=player_id)
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

    rc = crud_game.swap_tiles(db, game, req.position, target, clamp=movement.clamps)
    if rc == 1:
        return 6

    player_movement_cards.remove(req.movement)
    player_cards.movement_cards = serialize(player_movement_cards)

    temp_moves = deserialize(player_cards.temp_swaps_performed)
    temp_moves.append((req.movement, req.position, target, movement.clamps))
    player_cards.temp_swaps_performed = serialize(temp_moves)

    db.commit()

    return 0


def confirm_movements(db: Session, player_id: str):
    """
    Confirms temporary movements. To be used on end_turn.
    Returns 1 on unexpected problem, 0 if successful
    """
    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 1

    player_cards.temp_swaps_performed = serialize([])
    db.commit()

    return 0


def cancel_movements(db: Session, player_id: str, nmovs: int = 3):
    """
    Cancels the last 'nmovs' movements made by the player
    during their current turn.
    """
    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 1

    game = crud_game.get_game(db=db, player_id=player_id)
    if game is None:
        return 2

    mov_cards = deserialize(player_cards.movement_cards)

    used_movements = deserialize(player_cards.temp_swaps_performed)
    used_mov_count = len(used_movements)

    for m in range(max(nmovs, used_mov_count)):
        movement_data = used_movements[used_mov_count - m - 1]

        rc = crud_game.swap_tiles(
            db=db,
            game=game,
            origin=movement_data[1],
            target=movement_data[2],
            clamp=movement_data[3],
        )

        if rc == 1:
            return 3

        mov_cards.append(movement_data[0])
        player_cards.movement_cards = serialize(mov_cards)

        used_movements.pop(used_mov_count - m - 1)
        player_cards.temp_swaps_performed = serialize(used_movements)

        db.commit()

    return 0


def currently_used_movements(db: Session, player_id: str):
    game = crud_game.get_game(db=db, player_id=player_id)

    cards = []
    for player in deserialize(game.player_order):
        p_cards = get_player_cards(db=db, player_id=player)
        if not p_cards:
            continue
        cards += deserialize(p_cards.movement_cards)

    return cards
