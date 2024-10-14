from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import get_player_cards
from src.database.crud.crud_game import get_game_from_player
from src.database.crud.crud_player import get_player
from src.database.models import Game
from src.routers.helpers.connection_manager import game_manager
from src.schemas.card_schemas import validate_shape_cards
from src.schemas.game_schemas import (
    BoardStateSchema,
    GameStateMessageSchema,
    GameStateSchema,
    OtherPlayersStateSchema,
    SelfPlayerStateSchema,
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


async def broadcast_gamestate(player_id: str, db: Session):
    game = get_game_from_player(db=db, player_id=player_id)
    if game is None:
        return error_message(detail=errors.GAME_NOT_FOUND)

    players = deserialize(game.player_order)

    for player in players:
        await game_manager.send_personal_message(
            message=await handle_gamestate(player_id=player, db=db),
            player_id=player,
        )

    return None
