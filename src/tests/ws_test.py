from src.constants import errors
from src.database.crud.crud_cards import cancel_movements, get_player_cards
from src.database.crud.crud_game import get_game_from_player
from src.database.crud.crud_user import get_active_player_id_from_game
from src.database.db import get_session
from src.schemas.card_schemas import (
    MovementCardUsedSchema,
    ShapeCardSchema,
    ShapeCardUsedSchema,
    UseMovementCardSchema,
    UseShapeCardSchema,
)
from src.schemas.game_schemas import ChatMessage, GameCreate, NewChatMessageSchema
from src.schemas.message_schema import ErrorMessageSchema
from src.schemas.player_schemas import WinnerMessageSchema
from src.tests.test_utils import client, create_lobby, create_player
from src.tools.jsonify import deserialize, serialize


def test_game_end_turn():
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
    game = get_game_from_player(
        db=db,
        player_id=get_active_player_id_from_game(db, owner_id, lobby_id),
    )
    first_turn_id = deserialize(game.player_order)[game.current_turn]

    first_turn_id = (
        owner_id
        if get_active_player_id_from_game(db, owner_id, lobby_id) == first_turn_id
        else joiner_id
    )

    with client.websocket_connect(
        '/game/' + lobby_id + '?player_id=' + first_turn_id,
    ) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        websocket_owner.send_json(
            {
                'type': 'end-turn',
            },
        )
        data_received = websocket_owner.receive_json()

        assert data_received['type'] == 'turn-ended'
        assert data_received['playerId'] == first_turn_id

        db.refresh(game)
        new_turn_id = deserialize(game.player_order)[game.current_turn]
        assert new_turn_id != first_turn_id


def test_game_gamestate():
    owner_id = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', owner_id, 1, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=owner_id)
    client.post('/game', json=game_test.model_dump())

    with client.websocket_connect(
        '/game/' + lobby_test + '?player_id=' + owner_id,
    ) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        websocket_owner.send_json({'type': 'get-game-state'})
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'


def test_game_gamestate_br():
    owner_id = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', owner_id, 2, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=owner_id)
    client.post('/game', json=game_test.model_dump())

    with client.websocket_connect(
        '/game/' + lobby_test + '?player_id=' + owner_id,
    ) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'error'


def test_lobby_lobbystate():
    owner_id = create_player('testPlayer')
    lobby_id = create_lobby('testLobby', owner_id, 1, 4)
    players_info = [{'name': 'testPlayer', 'id': owner_id}]

    with client.websocket_connect(
        '/lobby/' + lobby_id + '?player_id=' + owner_id,
    ) as websocket_owner:
        websocket_owner.send_json({'type': 'get-lobby-state'})
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'player-list'

        data_received = websocket_owner.receive_json()
        assert data_received == {
            'type': 'lobby-state',
            'players': players_info,
            'owner': owner_id,
            'id': lobby_id,
            'name': 'testLobby',
        }


def test_card_movement():
    player_id = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_id, 1, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_id)
    client.post('/game', json=game_test.model_dump())

    db = next(get_session())

    game = get_game_from_player(
        db,
        get_active_player_id_from_game(db, player_id, lobby_test),
    )
    original_board = deserialize(game.board)

    pos0 = original_board[0]
    pos1 = original_board[7]

    cards = get_player_cards(
        db=db,
        player_id=get_active_player_id_from_game(db, player_id, lobby_test),
    )

    initial_cards = ['diagonal-adjacent', 'l-ccw', 'straight-edge']
    cards.movement_cards = serialize(initial_cards)
    db.commit()

    data = UseMovementCardSchema(
        type='use-movement-card',
        position=[0, 0],
        rotation='r0',
        movement='diagonal-adjacent',
    ).model_dump_json()

    with client.websocket_connect(
        '/game/' + lobby_test + '?player_id=' + player_id,
    ) as websocket_owner:
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

        game = get_game_from_player(
            db,
            get_active_player_id_from_game(db, player_id, lobby_test),
        )
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

        game = get_game_from_player(
            db,
            get_active_player_id_from_game(db, player_id, lobby_test),
        )

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

        game = get_game_from_player(
            db,
            get_active_player_id_from_game(db, player_id, lobby_test),
        )
        db.refresh(game)
        board = deserialize(game.board)

        assert pos0 == board[31]
        assert pos1 == board[7]

        cancel_movements(
            db=next(get_session()),
            player_id=get_active_player_id_from_game(db, player_id, lobby_test),
        )

        game = get_game_from_player(
            db,
            get_active_player_id_from_game(db, player_id, lobby_test),
        )
        db.refresh(game)
        board = deserialize(game.board)
        assert original_board == board

        cards = get_player_cards(
            db=next(get_session()),
            player_id=get_active_player_id_from_game(db, player_id, lobby_test),
        )
        assert set(deserialize(cards.movement_cards)) == set(initial_cards)
        assert deserialize(game.temp_switches) == []


def test_card_shape():
    player_id = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_id, 1, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_id)
    client.post('/game', json=game_test.model_dump())

    db = next(get_session())

    game = get_game_from_player(
        db,
        get_active_player_id_from_game(db, player_id, lobby_test),
    )

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

    cards = get_player_cards(
        db=db,
        player_id=get_active_player_id_from_game(db, player_id, lobby_test),
    )

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

    with client.websocket_connect(
        '/game/' + lobby_test + '?player_id=' + player_id,
    ) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        data = UseShapeCardSchema(
            type='use-shape-card',
            position=(0, 4),
            targetPlayerId=player_id,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ShapeCardUsedSchema(
                position=(0, 4),
                targetPlayerId=player_id,
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
            targetPlayerId=player_id,
        ).model_dump_json()

        websocket_owner.send_text(data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == ShapeCardUsedSchema(
                position=(4, 0),
                targetPlayerId=player_id,
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
            targetPlayerId=player_id,
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
            targetPlayerId=player_id,
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
            targetPlayerId=player_id,
        ).model_dump_json()

        websocket_owner.send_text(data)

        data_received = websocket_owner.receive_text()
        assert (
            data_received
            == ShapeCardUsedSchema(
                position=(4, 1),
                targetPlayerId=player_id,
            ).model_dump_json()
        )

        data_received = websocket_owner.receive_text()
        assert (
            data_received
            == WinnerMessageSchema(
                playerId=player_id,
                playerName='testPlayer',
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


def test_game_chat():
    player_id = create_player('testPlayer')
    lobby_test = create_lobby('testLobby', player_id, 1, 4)
    game_test = GameCreate(lobby_id=lobby_test, player_id=player_id)
    client.post('/game', json=game_test.model_dump())

    with client.websocket_connect(
        '/game/' + lobby_test + '?player_id=' + player_id,
    ) as websocket_owner:
        data_received = websocket_owner.receive_json()
        assert data_received['type'] == 'game-state'

        data = {
            'message': 'Test Message',
            'player_id': player_id,
        }

        client.post(f'/game/{lobby_test}/chat', json=data)
        data_received = websocket_owner.receive_text()

        assert (
            data_received
            == NewChatMessageSchema(
                message=ChatMessage(
                    text='Test Message',
                    sender='testPlayer',
                ),
            ).model_dump_json()
        )
