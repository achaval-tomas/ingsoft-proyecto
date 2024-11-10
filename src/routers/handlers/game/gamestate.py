from datetime import datetime, timezone

from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import get_player_cards
from src.database.crud.crud_game import get_game_from_player
from src.database.crud.crud_user import get_player
from src.database.models import Game
from src.schemas.card_schemas import validate_shape_cards
from src.schemas.game_schemas import (
    BoardStateSchema,
    GameStateMessageSchema,
    GameStateSchema,
    OtherPlayersStateSchema,
    SelfPlayerStateSchema,
    TemporalMovementSchema,
)
from src.schemas.message_schema import error_message
from src.tools.jsonify import deserialize


def extract_own_cards(db: Session, player: SelfPlayerStateSchema):
    player_cards = get_player_cards(db=db, player_id=player.id)

    player.shapeCardsInDeckCount = len(deserialize(player_cards.shape_cards_deck))

    player.shapeCardsInHand = validate_shape_cards(player_cards.shape_cards_in_hand)

    player.movementCardsInHand = deserialize(player_cards.movement_cards)


def extract_other_player_cards(db: Session, player: OtherPlayersStateSchema):
    player_cards = get_player_cards(db=db, player_id=player.id)

    player.shapeCardsInDeckCount = len(deserialize(player_cards.shape_cards_deck))

    player.shapeCardsInHand = validate_shape_cards(player_cards.shape_cards_in_hand)

    player.movementCardsInHandCount = len(deserialize(player_cards.movement_cards))


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


def extract_temporal_movements(game_data: Game):
    return [
        TemporalMovementSchema(
            movement=mov,
            position=pos,
            rotation=rot,
        )
        for mov, pos, rot in deserialize(game_data.temp_switches)
    ]


async def handle_gamestate(player_id: str, db: Session, **_):
    player_data = get_player(db=db, player_id=player_id)
    if not player_data:
        return error_message(detail=errors.PLAYER_NOT_FOUND)

    game_data = get_game_from_player(db=db, player_id=player_id)
    if not game_data:
        return error_message(detail=errors.GAME_NOT_FOUND)

    selfPlayerState = SelfPlayerStateSchema(
        id=player_id,
        roundOrder=deserialize(game_data.player_order).index(player_id),
        name=player_data.player_name,
    )
    extract_own_cards(db, selfPlayerState)
    selfPlayerState.id = player_data.user_id

    boardState = BoardStateSchema(
        tiles=deserialize(game_data.board),
        blockedColor=game_data.blocked_color,
    )

    otherPlayersState = extract_other_player_states(db, game_data, player_id)

    temporalMovements = extract_temporal_movements(game_data)

    game_state = GameStateSchema(
        selfPlayerState=selfPlayerState,
        otherPlayersState=otherPlayersState,
        boardState=boardState,
        currentRoundPlayer=game_data.current_turn,
        turnStart=game_data.turn_start,
        temporalMovements=temporalMovements,
    )

    response = GameStateMessageSchema(
        type='game-state',
        gameState=game_state,
        now=datetime.now(timezone.utc).isoformat(),
    )

    return response.model_dump_json()
