from sqlalchemy.orm import Session
from src.database.crud.crud_lobby import leave_lobby
from src.database.crud.tools.jsonify import serialize
from src.routers.handlers.ws_share_player_list import ws_share_player_list

async def ws_handle_leavelobby(player_id: str, db: Session):
    await ws_share_player_list(player_id=player_id, db=db, broadcast=True)
    rc = leave_lobby(player_id=player_id, db=db)
    if rc == 1:
        return serialize({'Error': 'Player Not Found'})
    elif rc == 2:
        return serialize({'Error': 'Lobby Not Found'})
    return ""