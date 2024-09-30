from sqlalchemy.orm import Session
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Lobby
from src.routers.helpers.connection_manager import lobby_manager

def player_list(lobby:Lobby, db: Session):
    players = []
    if lobby != None:
        players = deserialize(lobby.players)
    players_info = []
    for player_id in players:
        player = get_player(player_id=player_id, db=db)
        if player:
            players_info.append({
                'id': player.player_id,
                'name': player.player_name
            })
    return serialize({
        'type': 'player-list',
        'players': players_info
    })

async def ws_share_player_list(player_id: str, lobby_id: str, db: Session, broadcast: bool):
    lobby = get_lobby(db=db, lobby_id=lobby_id)
    if not lobby:
        await lobby_manager.send_personal_message(
            message=serialize({
                'type': 'Error',
                'message': 'El lobby con el que se desea conectar no existe'
            }),
            player_id=player_id
        )
        return
    players = player_list(lobby=lobby, db=db)
    if broadcast:
        await lobby_manager.broadcast_in_lobby(
            lobby_id=lobby_id,
            db=db,
            message=players
        )
    else:
        await lobby_manager.send_personal_message(
            player_id=player_id,
            message=players
        )
    return ""