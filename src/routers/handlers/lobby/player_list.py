from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_user import decode_player_id, get_player
from src.database.models import Lobby
from src.routers.helpers.connection_manager import lobby_manager
from src.schemas.message_schema import error_message
from src.schemas.player_schemas import PlayerInfoSchema, PlayerListMessageSchema
from src.tools.jsonify import deserialize


def player_list(lobby: Lobby, db: Session, user_id: str):
    players = []
    if lobby is not None:
        players = deserialize(lobby.players)

    players_info = []
    for player_id in players:
        player = get_player(player_id=player_id, db=db)
        if player:
            players_info.append(
                PlayerInfoSchema(
                    id=decode_player_id(
                        db=db,
                        player_id=player.player_id,
                        user_id=user_id,
                    ),
                    name=player.player_name,
                ),
            )

    return PlayerListMessageSchema(
        players=players_info,
    ).model_dump_json()


async def share_player_list(
    player_id: str,
    user_id: str,
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

    if broadcast:
        for id in deserialize(lobby.players):
            player = get_player(db, id)
            if player:
                await lobby_manager.send_personal_message(
                    player_id=id,
                    message=player_list(lobby=lobby, db=db, user_id=player.user_id),
                )
    else:
        await lobby_manager.send_personal_message(
            player_id=player_id,
            message=player_list(lobby=lobby, db=db, user_id=user_id),
        )
    return None
