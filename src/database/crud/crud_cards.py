from sqlalchemy.orm import Session

from src.database.cards.card_dealer import MovCardDealer, ShapeCardDealer
from src.database.cards.movement_card import movement_data, rotate_movement
from src.database.crud import crud_game
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import PlayerCards
from src.schemas.card_schemas import ShapeCardSchema, UseMovementCardSchema


def get_player_cards(db: Session, player_id: str):
    return (
        db.query(PlayerCards).filter(PlayerCards.player_id == player_id).one_or_none()
    )


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
    db.commit()

    return 0
