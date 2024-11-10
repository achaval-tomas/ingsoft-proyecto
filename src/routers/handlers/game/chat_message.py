from sqlalchemy.orm import Session

from src.database.crud.crud_game import get_game
from src.database.crud.crud_user import get_active_player_id_from_game, get_player
from src.routers.helpers.connection_manager import game_manager
from src.schemas.game_schemas import ChatMessage, NewChatMessageSchema, SendChatMessage


async def handle_chat_message(game_id: str, msg: SendChatMessage, db: Session, **_):
    player_id = get_active_player_id_from_game(
        db=db,
        user_id=msg.player_id,
        game_id=game_id,
    )
    player = get_player(db=db, player_id=player_id)
    if not player:
        return 1

    game = get_game(game_id=game_id, db=db)
    if not game:
        return 2

    message = NewChatMessageSchema(
        message=ChatMessage(
            sender=player.player_name,
            text=msg.message,
        ),
    ).model_dump_json()

    await game_manager.broadcast_in_game(
        message=message,
        game_id=game_id,
        db=db,
    )

    return 0
