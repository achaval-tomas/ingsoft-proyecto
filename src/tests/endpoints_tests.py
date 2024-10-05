from fastapi.testclient import TestClient

from src.database.schemas import GameCreate, LobbyCreate, PlayerCreate
from src.main import app

client = TestClient(app)

""" PLAYER TESTS """


def test_create_player():
    player_data = PlayerCreate(player_name='Test Player')
    response = client.post('/player', json=player_data.model_dump())

    assert response.status_code == 201
    # verify that the id was created
    data = response.json()
    assert 'player_id' in data


def test_create_player_br():
    player_data = PlayerCreate(player_name='')
    response = client.post('/player', json=player_data.model_dump())

    assert response.status_code == 400
    data = response.json()
    # verify that the id was not created
    assert 'player_id' not in data


""" GAME TESTS """


def test_create_game():
    player_test = PlayerCreate(player_name='TestGame')
    player_test_id = client.post('/player', json=player_test.model_dump())

    player_test_json = player_test_id.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    lobby_test = LobbyCreate(
        lobby_name='LobbyTest',
        lobby_owner=player_id,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())

    lobby_json = lobby_test_id.json()
    assert (
        'lobby_id' in lobby_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)

    response = client.post('/game', json=game_test.model_dump())

    assert response.status_code == 200


""" LOBBY TESTS """


def test_get_all_lobbies():
    data_owner_1 = {
        'player_name': 'owner 1',
    }
    owner_1 = client.post('/player', json=data_owner_1)
    owner_json_1 = owner_1.json()
    owner_id_1 = owner_json_1['player_id']

    data_owner_2 = {
        'player_name': 'owner 2',
    }
    owner_2 = client.post('/player', json=data_owner_2)
    owner_json_2 = owner_2.json()
    owner_id_2 = owner_json_2['player_id']

    data_owner_3 = {
        'player_name': 'owner 3',
    }
    owner_3 = client.post('/player', json=data_owner_3)
    owner_json_3 = owner_3.json()
    owner_id_3 = owner_json_3['player_id']

    data_lobby_1 = {
        'lobby_name': 'room 1',
        'lobby_owner': owner_id_1,
        'min_players': 2,
        'max_players': 4,
    }
    lobby_1 = client.post('/lobby', json=data_lobby_1)
    lobby_json_1 = lobby_1.json()
    lobby_id_1 = lobby_json_1['lobby_id']

    data_lobby_2 = {
        'lobby_name': 'room 2',
        'lobby_owner': owner_id_2,
        'min_players': 2,
        'max_players': 4,
    }
    lobby_2 = client.post('/lobby', json=data_lobby_2)
    lobby_json_2 = lobby_2.json()
    lobby_id_2 = lobby_json_2['lobby_id']

    data_lobby_3 = {
        'lobby_name': 'room 3',
        'lobby_owner': owner_id_3,
        'min_players': 2,
        'max_players': 4,
    }
    lobby_3 = client.post('/lobby', json=data_lobby_3)
    lobby_json_3 = lobby_3.json()
    lobby_id_3 = lobby_json_3['lobby_id']

    response = client.get('/lobby')
    assert response.status_code == 200


def test_join_lobby():
    data_owner = {
        'player_name': 'cage owner',
    }
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data_joiner = {
        'player_name': 'cage joiner',
    }
    joiner = client.post('/player', json=data_joiner)
    joiner_json = joiner.json()
    joiner_id = joiner_json['player_id']

    data_lobby = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 2,
        'max_players': 4,
    }
    lobby = client.post('/lobby', json=data_lobby)
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    response = client.post('/lobby/join', json=data)

    assert response.status_code == 202


def test_create_lobby():
    data_owner = {
        'player_name': 'cage owner',
    }
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 2,
        'max_players': 4,
    }
    response = client.post('/lobby', json=data)
    assert response.status_code == 200


def test_leave_lobby():
    data_owner = {
        'player_name': 'cage owner',
    }
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data_joiner = {
        'player_name': 'cage joiner',
    }
    joiner = client.post('/player', json=data_joiner)
    joiner_json = joiner.json()
    joiner_id = joiner_json['player_id']

    data_lobby = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 2,
        'max_players': 4,
    }
    lobby = client.post('/lobby', json=data_lobby)
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }
    response_join = client.post('/lobby/join', json=data)
    response_leave = client.post('/lobby/leave', json=data)

    assert response_leave.status_code == 200
