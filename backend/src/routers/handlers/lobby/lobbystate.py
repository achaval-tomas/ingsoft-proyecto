from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_lobby import get_lobby, get_lobby_by_player_id
from src.database.crud.crud_user import decode_player_id, get_player
from src.schemas.lobby_schemas import LobbyStateMessageSchema
from src.schemas.message_schema import error_message
from src.schemas.player_schemas import PlayerInfoSchema
from src.tools.jsonify import deserialize


def lobbystate_message(lobby_id: str, user_id: str, db: Session):
    lobby = get_lobby(lobby_id=lobby_id, db=db)
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

    owner = decode_player_id(db=db, user_id=user_id, player_id=lobby.lobby_owner)

    return LobbyStateMessageSchema(
        players=players_info,
        owner=owner,
        id=lobby_id,
        name=lobby.lobby_name,
    ).model_dump_json()


async def handle_lobbystate(player_id: str, user_id: str, db: Session, **_):
    lobby = get_lobby_by_player_id(db=db, player_id=player_id)

    if not lobby:
        return error_message(detail=errors.LOBBY_NOT_FOUND)

    return lobbystate_message(lobby_id=lobby.lobby_id, user_id=user_id, db=db)
