from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.constants import errors
from src.database.crud.crud_game import end_game_turn
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize
from src.schemas.message_schema import ErrorMessageSchema


async def ws_handle_endturn(player_id: str, db: Session):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return ErrorMessageSchema(
            message=errors.PLAYER_NOT_FOUND,
        ).model_dump_json()

    res = end_game_turn(db=db, player_id=player_id)

    if res == 0:
        await cm.game_manager.broadcast_in_game(
            game_id=player.game_id,
            db=db,
            message=serialize(
                {
                    'type': 'turn-ended',
                    'playerId': player_id,
                },
            ),
        )
    elif res == 1:
        return ErrorMessageSchema(
            message=errors.NOT_IN_GAME,
        ).model_dump_json()
    elif res == 2:
        return ErrorMessageSchema(
            message=errors.NOT_YOUR_TURN,
        ).model_dump_json()
    return ''
