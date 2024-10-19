from src.constants import errors
from src.database.crud.crud_game import delete_game, get_game_from_player
from src.database.crud.crud_lobby import delete_lobby
from src.database.crud.crud_player import delete_player
from src.database.db import get_session
from src.schemas.game_schemas import GameCreate
from src.schemas.lobby_schemas import (
    LobbyCreateSchema,
    LobbyJoinSchema,
    LobbyLeaveSchema,
)
from src.schemas.player_schemas import PlayerCreateSchema
from src.tests.test_utils import client, create_lobby, create_player

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
    player_test = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_test, 0, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_test)
    response = client.post('/game', json=game_test.model_dump())
    print(response.json())
    assert response.status_code == 200


def test_start_game_error_lobby_not_found():
    player_owner = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_owner, 0, 4)

    db = next(get_session())
    delete_lobby(db=db, lobby_id=lobby_test)

    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    response = client.post('/game', json=game_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_you_should_be_a_owner():
    player_owner = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_owner, 0, 4)
    fake_owner = create_player('FakeSantino')
    game_test = GameCreate(lobby_id=lobby_test, player_id=fake_owner)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.MUST_BE_OWNER
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_not_enough_players():
    player_owner = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_owner, 2, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.NOT_ENOUGH_PLAYERS
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_start_game_error_player_is_missing():
    player_owner = create_player('testPlayer')
    player_2 = create_player('Pablito')

    lobby_test = create_lobby('testLobby', player_owner, 1, 4)

    data_player = {
        'player_id': player_2,
        'lobby_id': lobby_test,
    }

    client.post('lobby/join', json=data_player)

    db = next(get_session())
    delete_player(db=db, player_id=player_2)

    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    response = client.post('/game', json=game_test.model_dump())
    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_IS_MISSING
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_game():
    player_owner = create_player('testPlayer')
    player_2 = create_player('Pablito')

    lobby_test = create_lobby('testLobby', player_owner, 0, 4)

    data_player_2 = {
        'player_id': player_2,
        'lobby_id': lobby_test,
    }

    client.post('lobby/join', json=data_player_2)

    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    client.post('/game', json=game_test.model_dump())
    response = client.post(
        '/game/leave',
        json={'playerId': player_2},
    )
    assert response.status_code == 200


def test_leave_game_error_game_not_found():
    player_owner = create_player('testPlayer')
    player_2 = create_player('Pablito')
    lobby_test = create_lobby('testLobby', player_owner, 0, 4)
    client.post('/lobby/join', json={'player_id': player_2, 'lobby_id': lobby_test})
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    client.post('/game', json=game_test.model_dump())

    db = next(get_session())
    game = get_game_from_player(db=db, player_id=player_owner)
    if game:
        delete_game(db=db, game_id=str(game.game_id))

    response = client.post('/game/leave', json={'playerId': player_2})

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.GAME_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_game_error_player_not_found():
    player_owner = create_player('testPlayer')
    player_2 = create_player('Pablito')
    lobby_test = create_lobby('testLobby', player_owner, 0, 4)
    client.post('/lobby/join', json={'player_id': player_2, 'lobby_id': lobby_test})
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_owner)
    client.post('/game', json=game_test.model_dump())

    db = next(get_session())
    delete_player(db=db, player_id=player_2)

    response = client.post('/game/leave', json={'playerId': player_2})

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


""" LOBBY TESTS """


def test_create_lobby():
    player_owner = create_player('Cage')
    data_lobby = LobbyCreateSchema(
        lobby_name='testLobby',
        lobby_owner=player_owner,
        min_players=2,
        max_players=4,
    )
    response = client.post('/lobby', json=data_lobby.model_dump())

    assert response.status_code == 200, "Lobby wasn't correctly created."
    data = response.json()
    assert 'lobby_id' in data


def test_create_lobby_error_player_not_found():
    player_owner = create_player('testPlayer')
    db = next(get_session())
    delete_player(db=db, player_id=player_owner)
    data_lobby = LobbyCreateSchema(
        lobby_name='room',
        lobby_owner=player_owner,
        min_players=2,
        max_players=4,
    )
    response = client.post('/lobby', json=data_lobby.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_create_lobby_error_already_joiner_other():
    player_owner = create_player('testPlayer')
    player_owner_2 = create_player('Cande')
    create_lobby('room 1', player_owner, 2, 4)
    data_lobby_2 = create_lobby('room 2', player_owner_2, 2, 4)

    player_join = LobbyJoinSchema(
        player_id=player_owner,
        lobby_id=data_lobby_2,
    )

    response = client.post('/lobby/join', json=player_join.model_dump())

    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.ALREADY_JOINED_OTHER
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_create_lobby_error_already_created_other():
    player_owner = create_player('testPlayer')

    data_lobby_1 = LobbyCreateSchema(
        lobby_name='room 1',
        lobby_owner=player_owner,
        min_players=2,
        max_players=4,
    )
    data_lobby_2 = LobbyCreateSchema(
        lobby_name='room 3',
        lobby_owner=player_owner,
        min_players=2,
        max_players=4,
    )
    response = client.post('/lobby', json=data_lobby_1.model_dump())
    response = client.post('/lobby', json=data_lobby_2.model_dump())

    assert (
        response.status_code == 400
    ), f'Se esperaba un status code 400, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.ALREADY_JOINED_OTHER
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_get_all_lobbies():
    player_test_1 = create_player('Cage')
    player_test_2 = create_player('Cande')
    player_test_3 = create_player('testPlayer')

    test_lobby_1 = create_lobby('room 1', player_test_1, 2, 4)
    test_lobby_2 = create_lobby('room 2', player_test_2, 2, 4)
    test_lobby_3 = create_lobby('room 3', player_test_3, 2, 4)

    response = client.get('/lobby')
    assert response.status_code == 200
    created_lobbys = [
        test_lobby_1,
        test_lobby_2,
        test_lobby_3,
    ]
    all_lobbys = response.json()
    lobbys_id = [lobby['lobby_id'] for lobby in all_lobbys]
    for lobby in created_lobbys:
        assert lobby in lobbys_id, f'{lobby} is not in the database.'


def test_join_lobby():
    player_test = create_player('Cage')
    player_test_2 = create_player('testPlayer')

    data_lobby = create_lobby('testLobby', player_test, 2, 4)

    player_join = LobbyJoinSchema(
        player_id=player_test_2,
        lobby_id=data_lobby,
    )

    response = client.post('/lobby/join', json=player_join.model_dump())

    assert response.status_code == 202


def test_join_lobby_error_player_not_found():
    player_test_1 = create_player('Cage')
    player_test_2 = create_player('Cande')

    test_lobby = create_lobby('room 1', player_test_1, 2, 4)

    joiner_test = LobbyJoinSchema(
        player_id=player_test_2,
        lobby_id=test_lobby,
    )

    db = next(get_session())
    delete_player(db, player_id=player_test_2)

    response = client.post('/lobby/join', json=joiner_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_join_lobby_error_lobby_not_found():
    player_test_1 = create_player('Cage')
    test_lobby = create_lobby('room 1', player_test_1, 2, 4)
    player_test_2 = create_player('Cande')

    joiner_test = LobbyJoinSchema(
        player_id=player_test_2,
        lobby_id=test_lobby,
    )

    db = next(get_session())
    delete_lobby(db, lobby_id=test_lobby)

    response = client.post('/lobby/join', json=joiner_test.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_join_lobby_error_lobby_full():
    player_test = create_player('Cage')
    player_test_2 = create_player('Cande')
    player_test_3 = create_player('testPlayer')

    lobby_id = create_lobby('testLobby', player_test, 2, 2)

    player_2_join = LobbyJoinSchema(
        player_id=player_test_2,
        lobby_id=lobby_id,
    )

    player_3_join = LobbyJoinSchema(
        player_id=player_test_3,
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
    player_test = create_player('Cage')
    lobby_id = create_lobby('testLobby', player_test, 2, 4)

    player_join = LobbyJoinSchema(
        player_id=player_test,
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
    player_test = create_player('Cage')
    lobby_id = create_lobby('testLobby', player_test, 2, 4)

    data = {
        'player_id': player_test,
        'lobby_id': lobby_id,
    }
    client.post('/lobby/join', json=data)
    response_leave = client.post('/lobby/leave', json=data)

    assert response_leave.status_code == 200


def test_leave_lobby_error_player_not_found():
    player_test = create_player('Cage')
    lobby_id = create_lobby('testLobby', player_test, 2, 4)
    player_test_2 = create_player('Cande')

    test_joiner = LobbyJoinSchema(
        player_id=player_test_2,
        lobby_id=lobby_id,
    )
    client.post('/lobby/join', json=test_joiner.model_dump())

    test_leaver = LobbyLeaveSchema(
        player_id=player_test_2,
        lobby_id=lobby_id,
    )
    db = next(get_session())
    delete_player(db, player_id=player_test_2)
    response = client.post('/lobby/leave', json=test_leaver.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.PLAYER_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"


def test_leave_lobby_error_lobby_not_found():
    player_test = create_player('Cage')
    lobby_id = create_lobby('testLobby', player_test, 2, 4)

    test_leaver = LobbyLeaveSchema(
        player_id=player_test,
        lobby_id=lobby_id,
    )

    db = next(get_session())
    delete_lobby(db, lobby_id=lobby_id)

    response = client.post('/lobby/leave', json=test_leaver.model_dump())

    assert (
        response.status_code == 404
    ), f'Se esperaba un status code 404, pero se recibió {response.status_code}'
    assert (
        response.json()['detail'] == errors.LOBBY_NOT_FOUND
    ), f"Mensaje de error incorrecto: {response.json()['detail']}"
