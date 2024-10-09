from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_game import delete_game, end_game_turn, get_game_players
from src.database.crud.crud_player import get_player
from src.routers.handlers.ws_handle_announce_winner import ws_handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.game_schemas import TurnEndedMessageSchema
from src.schemas.message_schema import error_message


async def ws_handle_endturn(player_id: str, db: Session):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return error_message(detail=errors.PLAYER_NOT_FOUND)

    res, new_movement_cards, new_shape_cards = end_game_turn(db=db, player_id=player_id)

    match res:
        case 1:
            return error_message(detail=errors.NOT_IN_GAME)
        case 2:
            return error_message(detail=errors.NOT_YOUR_TURN)
        case 3:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)
        case 4:
            await ws_handle_announce_winner(db=db, winner_id=player_id)
            delete_game(db=db, game_id=player.game_id)
            return ''

    msg = TurnEndedMessageSchema(
        playerId=player_id,
        newShapeCards=new_shape_cards,
    )

    players = get_game_players(db=db, game_id=player.game_id)
    for player in players:
        if player == player_id:
            continue
        await game_manager.send_personal_message(
            player_id=player,
            message=msg.model_dump_json(),
        )

    msg.newMovementCards = new_movement_cards

    return msg.model_dump_json()
