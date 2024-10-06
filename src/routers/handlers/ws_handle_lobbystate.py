from sqlalchemy.orm import Session

from src.constants import errors
from src.database.crud.crud_lobby import get_lobby, get_lobby_by_player_id
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.schemas.message_schema import ErrorMessageSchema


def lobbystate_message(lobby_id: str, db: Session):
    lobby = get_lobby(lobby_id=lobby_id, db=db)
    players = []
    if lobby is not None:
        players = deserialize(lobby.players)
    players_info = []
    for player_id in players:
        player = get_player(player_id=player_id, db=db)
        if player:
            players_info.append(
                {
                    'id': player.player_id,
                    'name': player.player_name,
                },
            )
    owner = lobby.lobby_owner

    return serialize(
        {
            'type': 'lobby-state',
            'players': players_info,
            'owner': owner,
            'id': lobby_id,
            'name': lobby.lobby_name,
        },
    )


async def ws_handle_lobbystate(player_id: str, db: Session):
    lobby = get_lobby_by_player_id(db=db, player_id=player_id)
    if not lobby:
        return ErrorMessageSchema(
            message=errors.LOBBY_NOT_FOUND,
        ).model_dump_json()

    return lobbystate_message(lobby_id=lobby.lobby_id, db=db)
