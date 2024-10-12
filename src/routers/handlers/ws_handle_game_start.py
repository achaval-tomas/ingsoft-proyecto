from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.database.crud import crud_game, crud_lobby
from src.schemas.message_schema import simple_message


async def ws_handle_game_start(player_id: str, lobby_id: str, db: Session):
    res = crud_game.create_game(db=db, lobby_id=lobby_id, player_id=player_id)

    if res == 0:
        await cm.lobby_manager.broadcast_in_lobby(
            db=db,
            lobby_id=lobby_id,
            message=simple_message('game-started'),
        )
        crud_lobby.delete_lobby(lobby_id=lobby_id, db=db)

    return res
