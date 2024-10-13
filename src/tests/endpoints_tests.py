from fastapi.testclient import TestClient

from src.constants import errors
from src.database.crud.crud_game import delete_game, get_game
from src.database.crud.crud_lobby import delete_lobby
from src.database.crud.crud_player import delete_player
from src.database.db import get_session
from src.main import app
from src.schemas.game_schemas import GameCreate
from src.schemas.lobby_schemas import (
    LobbyCreateSchema,
    LobbyJoinSchema,
    LobbyLeaveSchema,
)
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
        min_players=2,
        max_players=4,
    )
    lobby_response = client.post('/lobby', json=lobby_test.model_dump())
    lobby_test_json = lobby_response.json()
    lobby_id = lobby_test_json['lobby_id']

    db = next(get_session())
    delete_lobby(db=db, lobby_id=lobby_id)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)
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

    db = next(get_session())
    delete_player(db=db, player_id=player_id_2)

    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id_1)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
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

    db = next(get_session())
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

    db = next(get_session())
    delete_player(db=db, player_id=player_id_1)

    response = client.post('/game/leave', json={'playerId': player_id_1})

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


""" LOBBY TESTS """


def test_create_lobby():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    data_lobby = LobbyCreateSchema(
        lobby_name="cage's room",
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    response = client.post('/lobby', json=data_lobby.model_dump())

    assert response.status_code == 200, "Lobby wasn't correctly created."
    data = response.json()
    assert 'lobby_id' in data


def test_get_all_lobbies():
    player_test_1 = PlayerCreateSchema(player_name='Cage')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_test_1_json = player_test_1_id.json()
    player_1_id = player_test_1_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    player_test_3 = PlayerCreateSchema(player_name='Santino')
    player_test_3_id = client.post('/player', json=player_test_3.model_dump())
    player_test_3_json = player_test_3_id.json()
    player_3_id = player_test_3_json['player_id']

    test_lobby_1 = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_1_id,
        min_players=2,
        max_players=4,
    )
    test_lobby_1_id = client.post('/lobby', json=test_lobby_1.model_dump())
    test_lobby_1_json = test_lobby_1_id.json()
    test_lobby_1_id = test_lobby_1_json['lobby_id']

    test_lobby_2 = LobbyCreateSchema(
        lobby_name='room 2',
        lobby_owner=player_2_id,
        min_players=2,
        max_players=4,
    )
    test_lobby_2_id = client.post('/lobby', json=test_lobby_2.model_dump())
    test_lobby_2_json = test_lobby_2_id.json()
    test_lobby_2_id = test_lobby_2_json['lobby_id']

    test_lobby_3 = LobbyCreateSchema(
        lobby_name='room 3',
        lobby_owner=player_3_id,
        min_players=2,
        max_players=4,
    )
    test_lobby_3_id = client.post('/lobby', json=test_lobby_3.model_dump())
    test_lobby_3_json = test_lobby_3_id.json()
    test_lobby_3_id = test_lobby_3_json['lobby_id']

    response = client.get('/lobby')
    assert response.status_code == 200
    created_lobbys = [
        test_lobby_1.lobby_name,
        test_lobby_2.lobby_name,
        test_lobby_3.lobby_name,
    ]
    all_lobbys = response.json()
    lobby_names = [lobby['lobby_name'] for lobby in all_lobbys]
    for lobby in created_lobbys:
        assert lobby in lobby_names, f'{lobby} is not in the database.'


def test_join_lobby():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Santino')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    data_lobby = LobbyCreateSchema(
        lobby_name="cage's room",
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    lobby = client.post('/lobby', json=data_lobby.model_dump())
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    player_join = LobbyJoinSchema(
        player_id=player_2_id,
        lobby_id=lobby_id,
    )

    response = client.post('/lobby/join', json=player_join.model_dump())

    assert response.status_code == 202


def test_join_lobby_error_player_not_found():
    player_test_1 = PlayerCreateSchema(player_name='Cage')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_test_1_json = player_test_1_id.json()
    player_1_id = player_test_1_json['player_id']

    test_lobby = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_1_id,
        min_players=2,
        max_players=4,
    )
    test_lobby = client.post('/lobby', json=test_lobby.model_dump())
    test_lobby_json = test_lobby.json()
    test_lobby_id = test_lobby_json['lobby_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    joiner_test = LobbyJoinSchema(
        player_id=player_2_id,
        lobby_id=test_lobby_id,
    )

    db = next(get_session())
    delete_player(db, player_id=player_2_id)

    response = client.post('/lobby/join', json=joiner_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_join_lobby_error_lobby_not_found():
    player_test_1 = PlayerCreateSchema(player_name='Cage')
    player_test_1_id = client.post('/player', json=player_test_1.model_dump())
    player_test_1_json = player_test_1_id.json()
    player_1_id = player_test_1_json['player_id']

    test_lobby = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_1_id,
        min_players=2,
        max_players=4,
    )
    test_lobby = client.post('/lobby', json=test_lobby.model_dump())
    test_lobby_json = test_lobby.json()
    test_lobby_id = test_lobby_json['lobby_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    joiner_test = LobbyJoinSchema(
        player_id=player_2_id,
        lobby_id=test_lobby_id,
    )

    db = next(get_session())
    delete_lobby(db, lobby_id=test_lobby_id)

    response = client.post('/lobby/join', json=joiner_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_join_lobby_error_lobby_full():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_1_id = player_test_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    player_test_3 = PlayerCreateSchema(player_name='Santino')
    player_test_3_id = client.post('/player', json=player_test_3.model_dump())
    player_test_3_json = player_test_3_id.json()
    player_3_id = player_test_3_json['player_id']

    data_lobby = LobbyCreateSchema(
        lobby_name="cage's room",
        lobby_owner=player_1_id,
        min_players=2,
        max_players=2,
    )
    lobby = client.post('/lobby', json=data_lobby.model_dump())
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    player_2_join = LobbyJoinSchema(
        player_id=player_2_id,
        lobby_id=lobby_id,
    )

    player_3_join = LobbyJoinSchema(
        player_id=player_3_id,
        lobby_id=lobby_id,
    )

    client.post('/lobby/join', json=player_2_join.model_dump())
    response = client.post('/lobby/join', json=player_3_join.model_dump())

    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_IS_FULL
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_join_lobby_error_already_joined():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    data_lobby = LobbyCreateSchema(
        lobby_name="cage's room",
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    lobby = client.post('/lobby', json=data_lobby.model_dump())
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    player_join = LobbyJoinSchema(
        player_id=player_id,
        lobby_id=lobby_id,
    )

    response = client.post('/lobby/join', json=player_join.model_dump())

    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.ALREADY_JOINED
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_lobby():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    data_lobby = LobbyCreateSchema(
        lobby_name="cage's room",
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    lobby = client.post('/lobby', json=data_lobby.model_dump())
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    data = {
        'player_id': player_id,
        'lobby_id': lobby_id,
    }
    client.post('/lobby/join', json=data)
    response_leave = client.post('/lobby/leave', json=data)

    assert response_leave.status_code == 200


def test_leave_lobby_error_player_not_found():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    player_test_2 = PlayerCreateSchema(player_name='Cande')
    player_test_2_id = client.post('/player', json=player_test_2.model_dump())
    player_test_2_json = player_test_2_id.json()
    player_2_id = player_test_2_json['player_id']

    test_lobby = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    test_lobby = client.post('/lobby', json=test_lobby.model_dump())
    test_lobby_json = test_lobby.json()
    test_lobby_id = test_lobby_json['lobby_id']

    test_joiner = LobbyJoinSchema(
        player_id=player_2_id,
        lobby_id=test_lobby_id,
    )
    client.post('/lobby/join', json=test_joiner.model_dump())

    test_leaver = LobbyLeaveSchema(
        player_id=player_2_id,
        lobby_id=test_lobby_id,
    )
    db = next(get_session())
    delete_player(db, player_id=player_2_id)
    response = client.post('/lobby/leave', json=test_leaver.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_lobby_error_lobby_not_found():
    player_test = PlayerCreateSchema(player_name='Cage')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    test_lobby = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_id,
        min_players=2,
        max_players=4,
    )
    test_lobby = client.post('/lobby', json=test_lobby.model_dump())
    test_lobby_json = test_lobby.json()
    test_lobby_id = test_lobby_json['lobby_id']

    test_leaver = LobbyLeaveSchema(
        player_id=player_id,
        lobby_id=test_lobby_id,
    )

    db = next(get_session())
    delete_lobby(db, lobby_id=test_lobby_id)

    response = client.post('/lobby/leave', json=test_leaver.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"
