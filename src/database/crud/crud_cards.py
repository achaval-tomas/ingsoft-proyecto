from sqlalchemy.orm import Session

import src.database.crud.crud_game as crud_game
from src.database.cards.card_dealer import MovCardDealer, ShapeCardDealer
from src.database.cards.movement_card import movement_data, rotate_movement
from src.database.cards.shape_card import rotate_shape, shape_data
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import PlayerCards
from src.schemas.card_schemas import (
    ShapeCardSchema,
    UseMovementCardSchema,
    UseShapeCardSchema,
)


def get_player_cards(db: Session, player_id: str):
    return (
        db.query(PlayerCards).filter(PlayerCards.player_id == player_id).one_or_none()
    )


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

    shape_cards_hand = deserialize(player_cards.shape_cards_in_hand)

    if any(
        ShapeCardSchema.model_validate_json(c).isBlocked for c in shape_cards_hand
    ):  # There is a blocked card, shape refill not allowed.
        return 0, None, None

    shape_cards_deck = deserialize(player_cards.shape_cards_deck)

    to_hand = 3 - len(shape_cards_hand)
    available = len(shape_cards_deck)

    if (to_hand == 3) and (available == 0):
        # case winner
        return 3, None, None

    new_shape_cards = shape_cards_deck[0:to_hand]
    shape_cards_hand += new_shape_cards
    shape_cards_deck = shape_cards_deck[to_hand:]

    shape_card_schemas = [
        ShapeCardSchema.model_validate_json(c) for c in shape_cards_hand
    ]

    player_cards.shape_cards_in_hand = serialize(shape_cards_hand)
    player_cards.shape_cards_deck = serialize(shape_cards_deck)
    db.commit()

    return 0, mov_cards, shape_card_schemas


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
    Confirms temporary movements. To be used after discarding a shape.
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

    for m in range(min(nmovs, used_mov_count)):
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


def currently_used_movement_cards(db: Session, player_id: str):
    """
    Returns a list of all movement cards held by
    players who are in game with player @player_id
    """
    game = crud_game.get_game(db=db, player_id=player_id)

    cards = []
    for player in deserialize(game.player_order):
        p_cards = get_player_cards(db=db, player_id=player)
        if not p_cards:
            continue
        cards += deserialize(p_cards.movement_cards)

    return cards


def use_shape_card(db: Session, player_id: str, req: UseShapeCardSchema):
    player = get_player(player_id=player_id, db=db)
    if player is None:
        return 1

    game = crud_game.get_game(db=db, player_id=player_id)
    if game is None:
        return 2

    player_cards = get_player_cards(db=db, player_id=player_id)
    if player_cards is None:
        return 3

    player_order = deserialize(game.player_order)
    if player_order[game.current_turn] != player_id:
        return 4

    board = deserialize(game.board)
    start_index = get_board_index_from_coords(req.position)
    shape_color = board[start_index]

    if shape_color == game.blocked_color:
        return 5

    shape = find_connected_tiles(board, start_index)

    player_shape_cards = deserialize(player_cards.shape_cards_in_hand)
    player_shape_cards = [
        ShapeCardSchema.model_validate_json(s) for s in player_shape_cards
    ]
    player_usable_shapes = [s for s in player_shape_cards if not s.isBlocked]

    matched_shape = match_shape_to_player_card(
        player_cards=player_usable_shapes,
        target_shape=shape,
    )
    if not matched_shape:
        return 6

    player_shape_cards.remove(matched_shape)
    player_cards.shape_cards_in_hand = serialize(
        [s.model_dump_json() for s in player_shape_cards],
    )

    game.blocked_color = shape_color
    db.commit()

    if confirm_movements(db=db, player_id=player_id) == 1:
        return 3

    return 0


def find_connected_tiles(board: list[str], start_index: int):
    target_color = board[start_index]

    visited = [False] * 36
    queue = [start_index]
    selected: list[int] = []

    while len(queue) != 0:
        tile_index = queue.pop(0)

        if visited[tile_index]:
            continue
        visited[tile_index] = True

        tile_color = board[tile_index]

        if tile_color != target_color:
            continue
        selected.append(tile_index)

        [x, y] = get_coord_from_board_index(tile_index)

        if x > 0:
            queue.append(get_board_index_from_coords([x - 1, y]))
        if x < 5:
            queue.append(get_board_index_from_coords([x + 1, y]))
        if y > 0:
            queue.append(get_board_index_from_coords([x, y - 1]))
        if x < 5:
            queue.append(get_board_index_from_coords([x, y + 1]))

    return list(map(get_coord_from_board_index, selected))


def normalize_shape(shape: list[tuple[int, int]]):
    min_x = min(s[0] for s in shape)
    min_y = min(s[1] for s in shape)

    new_shape = [[s[0] - min_x, s[1] - min_y] for s in shape]

    return new_shape


def get_coord_from_board_index(index: int):
    return [index % 6, index // 6]


def get_board_index_from_coords(position: tuple[int, int]):
    return position[1] * 6 + position[0]


def match_shape_to_player_card(
    shape_cards: list[ShapeCardSchema],
    target_shape: list[tuple[int, int]],
):
    """
    Matches 'shape' to any rotation of a card
    in shape_cards according to shape_data.

    Returns ShapeCardSchema that matched if any, else None.
    """
    normalized_shape = normalize_shape(target_shape)

    for s in shape_cards:
        rotations = [
            normalize_shape(
                rotate_shape(shape_data[s.shape], i),
            )
            for i in range(4)
        ]

        if any(set(normalized_shape) == set(rot) for rot in rotations):
            return s

    return None
