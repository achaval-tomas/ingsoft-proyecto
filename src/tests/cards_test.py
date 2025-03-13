from src.database.crud.crud_cards import get_player_cards, refill_cards
from src.database.crud.crud_user import get_active_player_id_from_game
from src.database.db import get_session
from src.schemas.card_schemas import dump_shape_cards, validate_shape_cards
from src.schemas.game_schemas import GameCreate
from src.tests.test_utils import client, create_lobby, create_player
from src.tools.jsonify import deserialize, serialize


def test_initial_hand_cards():
    owner_id = create_player('testPlayer')
    joiner_id = create_player('testPlayer2')
    lobby_id = create_lobby('testLobby', owner_id, 2, 4)
    game_test = GameCreate(lobby_id=lobby_id, player_id=owner_id)
    client.post('/game', json=game_test.model_dump())

    data_join = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    client.post('/lobby/join', json=data_join)

    data_create = {
        'player_id': owner_id,
        'lobby_id': lobby_id,
    }
    client.post('/game', json=data_create)

    db = next(get_session())

    cards = get_player_cards(
        db=db,
        player_id=get_active_player_id_from_game(db, owner_id, lobby_id),
    )

    shape_cards_hand = deserialize(cards.shape_cards_in_hand)
    shape_cards_deck = deserialize(cards.shape_cards_deck)

    assert len(shape_cards_hand) == 3
    assert len(shape_cards_deck) == 22


def test_refill_cards():
    owner_id = create_player('testPlayer')
    joiner_id = create_player('testPlayer2')
    lobby_id = create_lobby('testLobby', owner_id, 2, 4)
    game_test = GameCreate(lobby_id=lobby_id, player_id=owner_id)
    client.post('/game', json=game_test.model_dump())

    data_join = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    client.post('/lobby/join', json=data_join)

    data_create = {
        'player_id': owner_id,
        'lobby_id': lobby_id,
    }
    client.post('/game', json=data_create)

    db = next(get_session())

    cards = get_player_cards(
        db=db,
        player_id=get_active_player_id_from_game(db, owner_id, lobby_id),
    )

    shape_cards = validate_shape_cards(cards.shape_cards_in_hand)
    shape_cards.pop(0)

    cards.shape_cards_in_hand = dump_shape_cards(shape_cards)
    cards.movement_cards = serialize([])
    db.commit()

    response_test, mov_cards_res, shape_cards_res = refill_cards(
        db=db,
        player_id=get_active_player_id_from_game(db, owner_id, lobby_id),
    )

    db.refresh(cards)
    shape_cards = validate_shape_cards(cards.shape_cards_in_hand)
    movement_cards = deserialize(cards.movement_cards)

    assert response_test == 0
    assert shape_cards == shape_cards_res and len(shape_cards) == 3
    assert movement_cards == mov_cards_res and len(movement_cards) == 3
