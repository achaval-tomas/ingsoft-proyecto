import asyncio

from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_game import (
    end_game_turn,
    get_game,
    get_game_from_player,
    get_game_players,
)
from src.database.crud.crud_user import get_player
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.game_schemas import TurnEndedMessageSchema
from src.schemas.message_schema import error_message
from src.tools.jsonify import deserialize


async def handle_end_turn(player_id: str, db: Session, **_):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return error_message(detail=errors.PLAYER_NOT_FOUND)

    res, mov_cards, shape_cards = end_game_turn(db=db, player_id=player_id)

    match res:
        case 1:
            return error_message(detail=errors.NOT_IN_GAME)
        case 2:
            return error_message(detail=errors.NOT_YOUR_TURN)
        case 3:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)

    handle_timer(db=db, game_id=player.game_id)

    msg_gen = TurnEndedMessageSchema(
        playerId=player_id,
        newShapeCards=shape_cards,
    ).model_dump_json()

    msg_player = TurnEndedMessageSchema(
        playerId=player_id,
        newShapeCards=shape_cards,
        newMovementCards=mov_cards,
    ).model_dump_json()

    players = get_game_players(db=db, game_id=player.game_id)
    for player in players:
        await game_manager.send_personal_message(
            player_id=player,
            message=msg_player if player == player_id else msg_gen,
        )

    if res == 4:
        await handle_announce_winner(db=db, winner_id=player_id)

    return None


async def turn_timer(db: Session, player_id: str, timestamp: str):
    await asyncio.sleep(120)

    game = get_game_from_player(db=db, player_id=player_id)
    if game and game.turn_start == timestamp:
        await handle_end_turn(player_id=player_id, db=db)


def handle_timer(db: Session, game_id: str):
    game = get_game(db=db, game_id=game_id)
    if game is None:
        return

    current_turn_id = deserialize(game.player_order)[game.current_turn]
    asyncio.ensure_future(
        turn_timer(
            db=db,
            player_id=current_turn_id,
            timestamp=game.turn_start,
        ),
    )
