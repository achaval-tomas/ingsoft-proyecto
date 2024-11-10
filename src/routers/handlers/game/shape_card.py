from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_cards import use_shape_card
from src.database.crud.crud_game import get_game_players
from src.database.crud.crud_user import get_player
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.card_schemas import ShapeCardUsedSchema, UseShapeCardSchema
from src.schemas.message_schema import error_message


async def handle_shape_card(user_id: str, player_id: str, db: Session, data: dict, **_):
    req = UseShapeCardSchema.model_validate_json(data)
    assert req.type == 'use-shape-card'

    rc = use_shape_card(
        player_id=player_id,
        target_id=player_id if req.targetPlayerId == user_id else req.targetPlayerId,
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

    player = get_player(db=db, player_id=player_id)

    for player in get_game_players(db=db, game_id=player.game_id):
        await game_manager.send_personal_message(
            player_id=player,
            message=ShapeCardUsedSchema(
                position=req.position,
                targetPlayerId=user_id
                if req.targetPlayerId == player
                else req.targetPlayerId,
            ).model_dump_json(),
        )

    if rc == 8:
        await handle_announce_winner(winner_id=player_id, db=db)

    return None
