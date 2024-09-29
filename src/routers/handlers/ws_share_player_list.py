from sqlalchemy.orm import Session
from src.database.crud.crud_lobby import get_lobby, get_lobby_by_player_id
from src.database.crud.tools.jsonify import deserialize, serialize
from src.routers.helpers.connection_manager import lobby_manager

def player_list(lobby_id:str, db: Session):
    lobby = get_lobby(lobby_id=lobby_id, db=db)
    players = []
    if lobby != None:
        players = deserialize(lobby.players)
    return serialize({
        'type': 'player-list',
        'players': players
    })

async def ws_share_player_list(player_id: str, db: Session, broadcast: bool):
    lobby = get_lobby_by_player_id(db=db, player_id=player_id)
    if not lobby:
        await lobby_manager.send_personal_message(
            message=serialize({
                'type': 'Error',
                'message': 'El lobby con el que se desea conectar no existe'
            }),
            player_id=player_id
        )
        return
    if broadcast:
        await lobby_manager.broadcast_in_lobby(
            lobby_id=lobby.lobby_id,
            db=db,
            message=player_list(lobby_id=lobby.lobby_id, db=db)
        )
    else:
        await lobby_manager.send_personal_message(
            player_id=player_id,
            db=db,
            message=player_list(lobby_id=lobby.lobby_id, db=db)
        )
    return ""