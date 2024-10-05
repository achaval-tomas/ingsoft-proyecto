from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_game_ws_end_turn():
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

    data_join = {
        'player_id': joiner_id,
        'lobby_id': lobby_id,
    }

    data_create = {
        'player_id': owner_id,
        'lobby_id': lobby_id,
    }

    response_lobby = client.post('/lobby/join', json=data_join)
    response_game = client.post('/game', json=data_create)

    with client.websocket_connect('/game/' + owner_id) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'
        owner_turn = data_received['gameState']['selfPlayerState']['roundOrder']
        current_turn = data_received['gameState']['currentRoundPlayer']

        if owner_turn == current_turn:
            websocket_owner.send_json(
                {
                    'type': 'end-turn',
                },
            )
            data_received = websocket_owner.receive_json()
            assert data_received == {
                'type': 'turn-ended',
                'playerId': owner_id,
            }
        else:
            with client.websocket_connect('/game/' + joiner_id) as websocket_joiner:
                data_received = websocket_joiner.receive_json()
                assert data_received['type'] == 'game-state'
                websocket_joiner.send_json(
                    {
                        'type': 'end-turn',
                    },
                )
                data_received = websocket_joiner.receive_json()
                assert data_received == {
                    'type': 'turn-ended',
                    'playerId': joiner_id,
                }


def test_game_ws_gamestate():
    data_owner = {
        'player_name': 'cage owner',
    }
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data_lobby = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 1,
        'max_players': 4,
    }
    lobby = client.post('/lobby', json=data_lobby)
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    data_create = {'player_id': owner_id, 'lobby_id': lobby_id}
    response_game = client.post('/game', json=data_create)

    with client.websocket_connect('/game/' + owner_id) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        websocket_owner.send_json({'type': 'get-game-state'})
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'


def test_game_ws_gamestate_br():
    data_owner = {'player_name': 'cage owner'}
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data_lobby = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 2,
        'max_players': 4,
    }
    lobby = client.post('/lobby', json=data_lobby)
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    data_create = {'player_id': owner_id, 'lobby_id': lobby_id}
    response_game = client.post('/game', json=data_create)

    with client.websocket_connect('/game/' + owner_id) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'error'


def test_lobby_ws_lobbystate():
    data_owner = {'player_name': 'cage owner'}
    owner = client.post('/player', json=data_owner)
    owner_json = owner.json()
    owner_id = owner_json['player_id']

    data_lobby = {
        'lobby_name': "cage's room",
        'lobby_owner': owner_id,
        'min_players': 2,
        'max_players': 4,
    }
    lobby = client.post('/lobby', json=data_lobby)
    lobby_json = lobby.json()
    lobby_id = lobby_json['lobby_id']

    players_info = [{'id': owner_id, 'name': 'cage owner'}]

    with client.websocket_connect('/lobby/' + owner_id) as websocket_owner:
        websocket_owner.send_json({'type': 'get-lobby-state'})
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'player-list'

        data_received = websocket_owner.receive_json()
        assert data_received == {
            'type': 'lobby-state',
            'players': players_info,
            'owner': owner_id,
            'id': lobby_id,
            'name': "cage's room",
        }
