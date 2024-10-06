from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize
from src.database.models import Lobby
from src.routers.helpers.connection_manager import lobby_manager
from src.schemas.message_schema import error_message
from src.schemas.player_schemas import PlayerInfoSchema, PlayerListMessageSchema


def player_list(lobby: Lobby, db: Session):
    players = []
    if lobby is not None:
        players = deserialize(lobby.players)

    players_info = []
    for player_id in players:
        player = get_player(player_id=player_id, db=db)
        if player:
            players_info.append(
                PlayerInfoSchema(
                    id=player.player_id,
                    name=player.player_name,
                ),
            )

    return PlayerListMessageSchema(
        players=players_info,
    ).model_dump_json()


async def ws_share_player_list(
    player_id: str,
    lobby_id: str,
    db: Session,
    broadcast: bool,
):
    lobby = get_lobby(db=db, lobby_id=lobby_id)

    if not lobby:
        await lobby_manager.send_personal_message(
            message=error_message(detail=errors.LOBBY_NOT_FOUND),
            player_id=player_id,
        )
        return

    players = player_list(lobby=lobby, db=db)
    if broadcast:
        await lobby_manager.broadcast_in_lobby(
            lobby_id=lobby_id,
            db=db,
            message=players,
        )
    else:
        await lobby_manager.send_personal_message(
            player_id=player_id,
            message=players,
        )
    return ''
