from sqlalchemy.orm import Session

from src.database.crud import crud_lobby
from src.database.crud.crud_player import get_player
from src.routers.handlers.lobby.player_list import share_player_list
from src.routers.helpers.connection_manager import lobby_manager
from src.schemas.message_schema import simple_message


async def handle_leave_lobby(player_id: str, lobby_id: str, db: Session):
    player = get_player(player_id=player_id, db=db)
    if not player:
        return 1

    res = crud_lobby.leave_lobby(db=db, player_id=player_id)

    if res == 0:
        await share_player_list(
            player_id=player_id,
            lobby_id=lobby_id,
            db=db,
            broadcast=True,
        )
    elif res == 3:  # Lobby owner left
        await lobby_manager.broadcast_in_lobby(
            db=db,
            lobby_id=lobby_id,
            message=simple_message('destroy-lobby'),
        )
        crud_lobby.delete_lobby(db=db, lobby_id=lobby_id)

    return res
