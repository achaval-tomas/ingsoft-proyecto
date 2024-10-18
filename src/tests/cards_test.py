from fastapi.testclient import TestClient

from src.database.crud.crud_cards import get_player_cards, refill_cards
from src.database.db import get_session
from src.main import app
from src.schemas.card_schemas import dump_shape_cards, validate_shape_cards
from src.schemas.game_schemas import GameCreate
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.schemas.player_schemas import PlayerCreateSchema
from src.tools.jsonify import deserialize, serialize

client = TestClient(app)


def test_initial_hand_cards():
    player_test = PlayerCreateSchema(player_name='testPlayer')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    data_joiner = {
        'player_name': 'cage joiner',
    }
    joiner = client.post('/player', json=data_joiner)
    joiner_json = joiner.json()
    joiner_id = joiner_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())
    lobby_json = lobby_test_id.json()
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    response = client.post('/lobby/join', json=data)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)
    response = client.post('/game', json=game_test.model_dump())
    assert response.status_code == 200

    db = next(get_session())

    cards = get_player_cards(db=db, player_id=player_id)

    shape_cards_hand = deserialize(cards.shape_cards_in_hand)
    shape_cards_deck = deserialize(cards.shape_cards_deck)

    assert len(shape_cards_hand) == 3
    assert len(shape_cards_deck) == 22


def test_refill_cards():
    player_test = PlayerCreateSchema(player_name='testPlayer')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    data_joiner = {
        'player_name': 'cage joiner',
    }
    joiner = client.post('/player', json=data_joiner)
    joiner_json = joiner.json()
    joiner_id = joiner_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())
    lobby_json = lobby_test_id.json()
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    response = client.post('/lobby/join', json=data)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)
    response = client.post('/game', json=game_test.model_dump())
    assert response.status_code == 200

    db = next(get_session())

    cards = get_player_cards(db=db, player_id=player_id)

    shape_cards = validate_shape_cards(cards.shape_cards_in_hand)
    shape_cards.pop(0)

    cards.shape_cards_in_hand = dump_shape_cards(shape_cards)
    cards.movement_cards = serialize([])
    db.commit()

    response_test, mov_cards_res, shape_cards_res = refill_cards(
        db=db,
        player_id=player_id,
    )

    db.refresh(cards)
    shape_cards = validate_shape_cards(cards.shape_cards_in_hand)
    movement_cards = deserialize(cards.movement_cards)

    assert response_test == 0
    assert shape_cards == shape_cards_res and len(shape_cards) == 3
    assert movement_cards == mov_cards_res and len(movement_cards) == 3
