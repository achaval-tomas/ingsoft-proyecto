from fastapi.testclient import TestClient

from src.constants import errors
from src.database.crud.crud_player import delete_player
from src.database.crud.crud_game import delete_game, get_game
from src.database.session import get_db
from src.main import app
from src.schemas.game_schemas import GameCreate
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.schemas.player_schemas import PlayerCreateSchema

client = TestClient(app)

""" PLAYER TESTS """


def test_create_player():
    player_data = PlayerCreateSchema(player_name='Test Player')
    response = client.post('/player', json=player_data.model_dump())

    assert response.status_code == 201
    # verify that the id was created
    data = response.json()
    assert 'player_id' in data


def test_create_player_br():
    player_data = PlayerCreateSchema(player_name='')
    response = client.post('/player', json=player_data.model_dump())

    assert response.status_code == 400
    data = response.json()
    # verify that the id was not created
    assert 'player_id' not in data


""" GAME TESTS """


def test_create_game():
    player_test = PlayerCreateSchema(player_name='TestGame')
    player_test_id = client.post('/player', json=player_test.model_dump())

    player_test_json = player_test_id.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    lobby_test = LobbyCreateSchema(
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


def test_start_game_error_lobby_not_found():
    player_test = PlayerCreateSchema(player_name='Santino')
    player_response = client.post('/player', json=player_test.model_dump())
    player_test_json = player_response.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id,
        min_players=0,
        max_players=4,
    )
    lobby_response = client.post('/lobby', json=lobby_test.model_dump())
    assert lobby_response.status_code == 200, 'No se pudo crear el lobby'
    lobby_test_json = lobby_response.json()

    assert (
        'lobby_id' in lobby_test_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_test_json['lobby_id']

    fake_lobby_id = '-1'

    game_test = GameCreate(lobby_id=fake_lobby_id, player_id=player_id)
    response = client.post('/game', json=game_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_you_should_be_a_owner():
    player_owner = PlayerCreateSchema(player_name='Santino')
    player_response = client.post('/player', json=player_owner.model_dump())
    player_owner_json = player_response.json()
    assert (
        'player_id' in player_owner_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_owner_id = player_owner_json['player_id']

    player_fake_owner = PlayerCreateSchema(player_name='Cande')
    player_response = client.post('/player', json=player_fake_owner.model_dump())
    player_fake_owner_json = player_response.json()
    assert (
        'player_id' in player_fake_owner_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_fake_owner_id = player_fake_owner_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_owner_id,
        min_players=0,
        max_players=4,
    )
    lobby_response = client.post('/lobby', json=lobby_test.model_dump())
    assert lobby_response.status_code == 200, 'No se pudo crear el lobby'
    lobby_test_json = lobby_response.json()

    assert (
        'lobby_id' in lobby_test_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_test_json['lobby_id']

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_fake_owner_id)
    response = client.post('/game', json=game_test.model_dump())

    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.MUST_BE_OWNER
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_not_enough_players():
    player_test = PlayerCreateSchema(player_name='Santino')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())

    lobby_json = lobby_test_id.json()
    assert (
        'lobby_id' in lobby_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': player_id,
        'lobby_id': lobby_id,
    }

    client.post('lobby/join', json=data)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.NOT_ENOUGH_PLAYERS
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_player_is_missing():
    player_test_1 = PlayerCreateSchema(player_name='Santino')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_test_1_json = player_test_1_id.json()
    assert (
        'player_id' in player_test_1_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id_1 = player_test_1_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    assert (
        'player_id' in player_test_2_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id_2 = player_test_2_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id_1,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())

    lobby_json = lobby_test_id.json()
    assert (
        'lobby_id' in lobby_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']

    data_player_1 = {
        'player_id': player_id_1,
        'lobby_id': lobby_id,
    }
    data_player_2 = {
        'player_id': player_id_2,
        'lobby_id': lobby_id,
    }

    client.post('lobby/join', json=data_player_1)
    client.post('lobby/join', json=data_player_2)

    db = next(get_db())
    delete_player(db=db, player_id=player_id_2)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id_1)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_IS_MISSING
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_game():
    player_test_1 = PlayerCreateSchema(player_name='Santino')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_test_1_json = player_test_1_id.json()
    assert (
        'player_id' in player_test_1_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id_1 = player_test_1_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    assert (
        'player_id' in player_test_2_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id_2 = player_test_2_json['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id_1,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())

    lobby_json = lobby_test_id.json()
    assert (
        'lobby_id' in lobby_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']

    data_player_1 = {
        'player_id': player_id_1,
        'lobby_id': lobby_id,
    }
    data_player_2 = {
        'player_id': player_id_2,
        'lobby_id': lobby_id,
    }

    client.post('lobby/join', json=data_player_1)
    client.post('lobby/join', json=data_player_2)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id_1)
    client.post('/game', json=game_test.model_dump())
    response = client.post(
        '/game/leave',
        json={'playerId': player_id_2},
    )
    assert response.status_code == 200


def test_leave_game_error_game_not_found():
    player_test_1 = PlayerCreateSchema(player_name='Santino')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_id_1 = player_test_1_id.json()['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_id_2 = player_test_2_id.json()['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id_1,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())
    lobby_id = lobby_test_id.json()['lobby_id']

    client.post('/lobby/join', json={'player_id': player_id_1, 'lobby_id': lobby_id})
    client.post('/lobby/join', json={'player_id': player_id_2, 'lobby_id': lobby_id})

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id_1)
    client.post('/game', json=game_test.model_dump())

    db = next(get_db())
    game = get_game(db=db, player_id=player_id_1)
    if game:
        delete_game(db=db, game_id=str(game.game_id))

    response = client.post('/game/leave', json={'playerId': player_id_2})

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.GAME_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_game_error_player_not_found():
    player_test_1 = PlayerCreateSchema(player_name='Santino')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_id_1 = player_test_1_id.json()['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_id_2 = player_test_2_id.json()['player_id']

    lobby_test = LobbyCreateSchema(
        lobby_name='LobbyTest',
        lobby_owner=player_id_1,
        min_players=0,
        max_players=4,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())
    lobby_id = lobby_test_id.json()['lobby_id']

    client.post('/lobby/join', json={'player_id': player_id_1, 'lobby_id': lobby_id})
    client.post('/lobby/join', json={'player_id': player_id_2, 'lobby_id': lobby_id})

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id_1)
    client.post('/game', json=game_test.model_dump())

    db = next(get_db())
    delete_player(db=db, player_id=player_id_1)

    response = client.post('/game/leave', json={'playerId': player_id_1})

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


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
