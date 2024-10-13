from fastapi.testclient import TestClient

from src.constants import errors
from src.database.crud.crud_cards import cancel_movements, get_player_cards
from src.database.crud.crud_game import get_game
from src.database.db import get_session
from src.main import app
from src.schemas.card_schemas import (
    MovementCardUsedSchema,
    ShapeCardSchema,
    ShapeCardUsedSchema,
    UseMovementCardSchema,
    UseShapeCardSchema,
)
from src.schemas.game_schemas import GameCreate
from src.schemas.lobby_schemas import LobbyCreateSchema
from src.schemas.message_schema import ErrorMessageSchema
from src.schemas.player_schemas import PlayerCreateSchema, WinnerMessageSchema
from src.tools.jsonify import deserialize, serialize

client = TestClient(app)


# def test_game_end_turn():
#     data_owner = {
#         'player_name': 'cage owner',
#     }
#     owner = client.post('/player', json=data_owner)
#     owner_json = owner.json()
#     owner_id = owner_json['player_id']

#     data_joiner = {
#         'player_name': 'cage joiner',
#     }
#     joiner = client.post('/player', json=data_joiner)
#     joiner_json = joiner.json()
#     joiner_id = joiner_json['player_id']

#     data_lobby = {
#         'lobby_name': "cage's room",
#         'lobby_owner': owner_id,
#         'min_players': 2,
#         'max_players': 4,
#     }
#     lobby = client.post('/lobby', json=data_lobby)
#     lobby_json = lobby.json()
#     lobby_id = lobby_json['lobby_id']

#     data_join = {
#         'player_id': joiner_id,
#         'lobby_id': lobby_id,
#     }

#     data_create = {
#         'player_id': owner_id,
#         'lobby_id': lobby_id,
#     }

#     client.post('/lobby/join', json=data_join)
#     client.post('/game', json=data_create)

#     with client.websocket_connect('/game/' + owner_id) as websocket_owner:
#         data_received = websocket_owner.receive_json()
#         assert data_received['type'] == 'game-state'
#         owner_turn = data_received['gameState']['selfPlayerState']['roundOrder']
#         current_turn = data_received['gameState']['currentRoundPlayer']

#         if owner_turn == current_turn:
#             websocket_owner.send_json(
#                 {
#                     'type': 'end-turn',
#                 },
#             )
#             data_received = websocket_owner.receive_json()
#             assert data_received == {
#                 'type': 'turn-ended',
#                 'playerId': owner_id,
#             }
#         else:
#             with client.websocket_connect('/game/' + joiner_id) as websocket_joiner:
#                 data_received = websocket_joiner.receive_json()
#                 assert data_received['type'] == 'game-state'
#                 websocket_joiner.send_json(
#                     {
#                         'type': 'end-turn',
#                     },
#                 )
#                 data_received = websocket_joiner.receive_json()
#                 assert data_received == {
#                     'type': 'turn-ended',
#                     'playerId': joiner_id,
#                 }


def test_game_gamestate():
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
    client.post('/game', json=data_create)

    with client.websocket_connect('/game/' + owner_id) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        websocket_owner.send_json({'type': 'get-game-state'})
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'


def test_game_gamestate_br():
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
    client.post('/game', json=data_create)

    with client.websocket_connect('/game/' + owner_id) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'error'


def test_lobby_lobbystate():
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


def test_card_movement():
    player_test = PlayerCreateSchema(player_name='TestGame')
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

    game = get_game(db, player_id)
    current_turn = deserialize(game.player_order)[game.current_turn]
    original_board = deserialize(game.board)

    pos0 = original_board[0]
    pos1 = original_board[7]

    cards = get_player_cards(db=db, player_id=current_turn)

    initial_cards = ['diagonal-adjacent', 'l-ccw', 'straight-edge']
    cards.movement_cards = serialize(initial_cards)
    db.commit()

    data = UseMovementCardSchema(
        type='use-movement-card',
        position=[0, 0],
        rotation='r0',
        movement='diagonal-adjacent',
    ).model_dump_json()

    with client.websocket_connect('/game/' + current_turn) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == MovementCardUsedSchema(
                position=(0, 0),
                rotation='r0',
                movement='diagonal-adjacent',
            ).model_dump_json()
        )

        game = get_game(db, player_id)
        board = deserialize(game.board)

        assert pos0 == board[7]
        assert pos1 == board[0]

        data = UseMovementCardSchema(
            type='use-movement-card',
            position=(0, 0),
            rotation='r0',
            movement='l-ccw',
        ).model_dump_json()

        pos0 = board[0]
        pos1 = board[8]

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == MovementCardUsedSchema(
                position=(0, 0),
                rotation='r0',
                movement='l-ccw',
            ).model_dump_json()
        )

        game = get_game(db, player_id)
        db.refresh(game)
        board = deserialize(game.board)

        assert pos0 == board[8]
        assert pos1 == board[0]

        data = UseMovementCardSchema(
            type='use-movement-card',
            position=(1, 1),
            rotation='r90',
            movement='straight-edge',
        ).model_dump_json()

        pos0 = board[7]
        pos1 = board[31]

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == MovementCardUsedSchema(
                position=(1, 1),
                rotation='r90',
                movement='straight-edge',
            ).model_dump_json()
        )

        game = get_game(db, player_id)
        db.refresh(game)
        board = deserialize(game.board)

        assert pos0 == board[31]
        assert pos1 == board[7]

        cancel_movements(db=next(get_session()), player_id=current_turn)

        game = get_game(db, player_id)
        db.refresh(game)
        board = deserialize(game.board)
        assert original_board == board

        cards = get_player_cards(db=next(get_session()), player_id=current_turn)
        assert set(deserialize(cards.movement_cards)) == set(initial_cards)
        assert deserialize(cards.temp_switches) == []


def test_card_shape():
    player_test = PlayerCreateSchema(player_name='TestGame')
    player_test_id = client.post('/player', json=player_test.model_dump())
    player_test_json = player_test_id.json()
    player_id = player_test_json['player_id']

    data_joiner = {
        'player_name': 'TestGame',
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

    game = get_game(db, player_id)
    current_turn = deserialize(game.player_order)[game.current_turn]

    game.board = serialize(
        to_board_tiles(
            [
                'rrrggg',
                'yrggbb',
                'ygrbbr',
                'gyybgg',
                'rrrggr',
                'rgbgrr',
            ],
        ),
    )

    cards = get_player_cards(db=db, player_id=current_turn)

    forced_cards = ['b-4', 'c-1', 'c-3']
    shape_cards = [
        ShapeCardSchema(shape=s, isBlocked=False).model_dump_json()
        for s in forced_cards
    ]
    forced_cards.pop(0)
    cards.shape_cards_in_hand = serialize(shape_cards)
    cards.shape_cards_deck = serialize([])

    db.commit()
    db.refresh(cards)
    db.refresh(game)

    with client.websocket_connect('/game/' + current_turn) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(0, 4),
            targetPlayerId=current_turn,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ShapeCardUsedSchema(
                position=(0, 4),
                targetPlayerId=current_turn,
            ).model_dump_json()
        )

        db.refresh(cards)
        shape_cards = deserialize(cards.shape_cards_in_hand)

        shape_cards = [
            ShapeCardSchema.model_validate_json(s).shape for s in shape_cards
        ]

        assert set(shape_cards) == set(forced_cards)

        forced_cards.pop(0)

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(4, 0),
            targetPlayerId=current_turn,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ShapeCardUsedSchema(
                position=(4, 0),
                targetPlayerId=current_turn,
            ).model_dump_json()
        )

        db.refresh(cards)
        shape_cards = deserialize(cards.shape_cards_in_hand)

        shape_cards = [
            ShapeCardSchema.model_validate_json(s).shape for s in shape_cards
        ]

        assert set(shape_cards) == set(forced_cards)

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(2, 2),
            targetPlayerId=current_turn,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ErrorMessageSchema(
                message=errors.INVALID_CARD,
            ).model_dump_json()
        )

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(4, 3),
            targetPlayerId=current_turn,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ErrorMessageSchema(
                message=errors.INVALID_COLOR,
            ).model_dump_json()
        )

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(4, 1),
            targetPlayerId=current_turn,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == WinnerMessageSchema(
                playerId=current_turn,
                playerName='TestGame',
            ).model_dump_json()
        )


def to_board_tiles(rows: list[str]):
    board = []
    for row in rows:
        for c in row:
            match c:
                case 'r':
                    board.append('red')
                case 'g':
                    board.append('green')
                case 'b':
                    board.append('blue')
                case 'y':
                    board.append('yellow')
    return board
