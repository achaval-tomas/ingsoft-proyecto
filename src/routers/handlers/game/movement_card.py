from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import use_movement_card
from src.database.crud.crud_player import get_player
from src.routers.helpers.connection_manager import game_manager
from src.schemas.card_schemas import MovementCardUsedSchema, UseMovementCardSchema
from src.schemas.message_schema import error_message


async def handle_movement_card(player_id: str, db: Session, data: dict):
    req = UseMovementCardSchema.model_validate_json(data)
    assert req.type == 'use-movement-card'

    rc = use_movement_card(player_id=player_id, db=db, req=req)

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
        case 6:
            return error_message(detail=errors.MOVEMENT_OUT_OF_BOUNDS)

    msg = MovementCardUsedSchema(
        position=req.position,
        rotation=req.rotation,
        movement=req.movement,
    ).model_dump_json()

    player = get_player(db=db, player_id=player_id)
    await game_manager.broadcast_in_game(
        game_id=player.game_id,
        db=db,
        message=msg,
    )

    return None
