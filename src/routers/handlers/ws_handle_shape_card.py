from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import use_shape_card
from src.schemas.card_schemas import UseShapeCardSchema
from src.schemas.message_schema import error_message


def ws_handle_shape_card(player_id: str, db: Session, data: dict):
    req = UseShapeCardSchema.model_validate_json(data)

    assert req.type == 'use-shape-card'

    rc = use_shape_card(player_id=player_id, db=db, req=req)

    match rc:
        case 1:
            return error_message(detail=errors.PLAYER_NOT_FOUND)
        case 2:
            return error_message(detail=errors.GAME_NOT_FOUND)
        case 3:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)
        case 4:
            return error_message(detail=errors.INVALID_CARD)
        case 5:
            return error_message(detail=errors.NOT_YOUR_TURN)

    return ''
