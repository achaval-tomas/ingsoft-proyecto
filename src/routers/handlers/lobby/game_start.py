from sqlalchemy.orm import Session

from src.database.crud import crud_game, crud_lobby
from src.database.crud.crud_player import get_player
from src.routers.handlers.game.end_turn import handle_timer
from src.routers.helpers.connection_manager import lobby_manager
from src.schemas.message_schema import simple_message


async def handle_game_start(player_id: str, lobby_id: str, db: Session):
    res = crud_game.create_game(db=db, lobby_id=lobby_id, player_id=player_id)
    player = get_player(db=db, player_id=player_id)

    if res == 0:
        await lobby_manager.broadcast_in_lobby(
            db=db,
            lobby_id=lobby_id,
            message=simple_message('game-started'),
        )
        crud_lobby.delete_lobby(lobby_id=lobby_id, db=db)
        handle_timer(db=db, game_id=player.game_id)

    return res
