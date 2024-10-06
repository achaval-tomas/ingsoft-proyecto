import jsonpickle
from sqlalchemy.orm import Session

from src.database.crud.crud_game import get_game
from src.database.crud.crud_player import get_player, get_player_cards
from src.database.crud.tools.jsonify import deserialize
from src.database.models import Game, PlayerCards
from src.schemas.card_schemas import ShapeCardSchema
from src.schemas.game_schemas import (
    BoardStateSchema,
    GameStateMessageSchema,
    GameStateSchema,
    OtherPlayersStateSchema,
    SelfPlayerStateSchema,
)
from src.schemas.message_schema import ErrorMessageSchema


def list_shape_cards(cards: PlayerCards):
    shape_cards = []
    for card in jsonpickle.loads(cards.shape_cards_in_hand):
        card_data = ShapeCardSchema(
            shape=card['shape']['_value_'],
            isBlocked=card['isBlocked'],
        )
        shape_cards.append(card_data)
    return shape_cards


def list_movement_cards(cards: PlayerCards):
    return [
        card['mov_type']['_value_'] for card in jsonpickle.loads(cards.movement_cards)
    ]


def extract_own_cards(db: Session, player: SelfPlayerStateSchema):
    player_cards = get_player_cards(db=db, player_id=player.id)

    player.shapeCardsInDeckCount = len(jsonpickle.loads(player_cards.shape_cards_deck))

    player.shapeCardsInHand = list_shape_cards(player_cards)

    player.movementCardsInHand = list_movement_cards(player_cards)


def extract_other_player_cards(db: Session, player: OtherPlayersStateSchema):
    player_cards = get_player_cards(db=db, player_id=player.id)

    player.shapeCardsInDeckCount = len(jsonpickle.loads(player_cards.shape_cards_deck))

    player.shapeCardsInHand = list_shape_cards(player_cards)

    player.movementCardsInHandCount = len(list_movement_cards(player_cards))


def extract_other_player_states(db: Session, game_data: Game, player_id: str):
    other_players_state = []
    other_players = [
        player for player in deserialize(game_data.player_order) if player != player_id
    ]
    for op_id in other_players:
        player = OtherPlayersStateSchema(
            id=op_id,
            roundOrder=deserialize(game_data.player_order).index(op_id),
            name=get_player(db=db, player_id=op_id).player_name,
        )

        extract_other_player_cards(db, player)

        other_players_state.append(player)

    return other_players_state


def ws_handle_gamestate(player_id: str, db: Session):
    player_data = get_player(db=db, player_id=player_id)
    if not player_data:
        error = ErrorMessageSchema()
        error.type = 'error'
        error.message = 'Player Not Found'
        return error.model_dump_json()
    game_data = get_game(db=db, player_id=player_id)
    if not game_data:
        error = ErrorMessageSchema()
        error.type = 'error'
        error.message = 'Game Not Found'
        return error.model_dump_json()

    selfPlayerState = SelfPlayerStateSchema(
        id=player_id,
        roundOrder=deserialize(game_data.player_order).index(player_id),
        name=player_data.player_name,
    )
    extract_own_cards(db, selfPlayerState)

    boardState = BoardStateSchema(
        tiles=deserialize(game_data.board),
        blockedColor=game_data.blocked_color,
    )

    otherPlayersState = extract_other_player_states(db, game_data, player_id)

    game_state = GameStateSchema(
        selfPlayerState=selfPlayerState,
        otherPlayersState=otherPlayersState,
        boardState=boardState,
        turnStart=0,
        currentRoundPlayer=game_data.current_turn,
    )

    response = GameStateMessageSchema(
        type='game-state',
        gameState=game_state,
    )

    return response.model_dump_json()
