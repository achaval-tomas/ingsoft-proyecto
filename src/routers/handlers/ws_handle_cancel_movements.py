from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import cancel_movements
from src.routers.handlers.ws_handle_gamestate import ws_broadcast_gamestate
from src.schemas.game_schemas import CancelMovementsMessageSchema
from src.schemas.message_schema import error_message


async def ws_handle_cancel_movements(db: Session, player_id: str, data: dict):
    req = CancelMovementsMessageSchema.model_validate_json(data)
    assert req.type == 'cancel-movements'

    rc = cancel_movements(db=db, player_id=player_id, nmovs=req.amount)

    match rc:
        case -1:
            return None
        case 1:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)
        case 2:
            return error_message(detail=errors.GAME_NOT_FOUND)
        case 3:
            return error_message(detail=errors.MOVEMENT_OUT_OF_BOUNDS)

    res = await ws_broadcast_gamestate(db=db, player_id=player_id)
    return res
