from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import use_shape_card
from src.database.crud.crud_user import decode_player_id, get_player
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.card_schemas import ShapeCardUsedSchema, UseShapeCardSchema
from src.schemas.message_schema import error_message


async def handle_shape_card(user_id: str, player_id: str, db: Session, data: dict):
    req = UseShapeCardSchema.model_validate_json(data)
    assert req.type == 'use-shape-card'

    rc = use_shape_card(
        player_id=player_id,
        target_id=req.targetPlayerId,
        db=db,
        req=req,
    )

    match rc:
        case 1:
            return error_message(detail=errors.PLAYER_NOT_FOUND)
        case 2:
            return error_message(detail=errors.GAME_NOT_FOUND)
        case 3:
            return error_message(detail=errors.INTERNAL_SERVER_ERROR)
        case 4:
            return error_message(detail=errors.NOT_YOUR_TURN)
        case 5:
            return error_message(detail=errors.INVALID_COLOR)
        case 6:
            return error_message(detail=errors.CANNOT_BLOCK)
        case 7:
            return error_message(detail=errors.INVALID_CARD)

    msg = ShapeCardUsedSchema(
        position=req.position,
        targetPlayerId=decode_player_id(
            db=db,
            player_id=req.targetPlayerId,
            user_id=user_id,
        ),
    ).model_dump_json()

    player = get_player(db=db, player_id=player_id)
    await game_manager.broadcast_in_game(
        game_id=player.game_id,
        db=db,
        message=msg,
    )

    if rc == 8:
        await handle_announce_winner(user_id=user_id, winner_id=player_id, db=db)

    return None
