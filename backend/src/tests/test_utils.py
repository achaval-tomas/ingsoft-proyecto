from fastapi.testclient import TestClient

from src.main import app
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.schemas.player_schemas import PlayerCreateSchema

client = TestClient(app)


def create_player(playername: str):
    player_test = PlayerCreateSchema(player_name=playername)
    player_test_id = client.post('/player', json=player_test.model_dump())

    player_test_json = player_test_id.json()
    assert (
        'player_id' in player_test_json
    ), "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']

    return player_id


def create_lobby(lobbyname: str, player_owner: str, minplayers: int, maxplayers: int, pw: str = ''):
    lobby_test = LobbyCreateSchema(
        lobby_name=lobbyname,
        lobby_owner=player_owner,
        min_players=minplayers,
        max_players=maxplayers,
        password=pw,
    )
    lobby_test_id = client.post('/lobby', json=lobby_test.model_dump())

    lobby_json = lobby_test_id.json()
    assert (
        'lobby_id' in lobby_json
    ), "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']
    return lobby_id
