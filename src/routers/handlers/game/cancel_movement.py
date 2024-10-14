from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import cancel_movements
from src.database.crud.crud_player import get_player
from src.routers.helpers.connection_manager import game_manager
from src.schemas.message_schema import error_message, simple_message


async def handle_cancel_movement(db: Session, player_id: str, **_):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return error_message(detail=errors.PLAYER_NOT_FOUND)

    rc = cancel_movements(db=db, player_id=player_id, nmovs=1)

    match rc:
        case -1:
            return error_message(detail=errors.NO_MOVEMENTS_TO_CANCEL)
        case 1:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)
        case 2:
            return error_message(detail=errors.GAME_NOT_FOUND)
        case 3:
            return error_message(detail=errors.NOT_YOUR_TURN)
        case 4:
            return error_message(detail=errors.MOVEMENT_OUT_OF_BOUNDS)

    await game_manager.broadcast_in_game(
        db=db,
        player_id=player_id,
        message=simple_message(
            msg_type='movement-cancelled',
        ),
    )

    return None
