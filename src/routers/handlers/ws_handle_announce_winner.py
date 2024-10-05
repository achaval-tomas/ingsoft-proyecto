from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize


async def ws_handle_announce_winner(winner_id: str, db: Session):
    player = get_player(player_id=winner_id, db=db)
    if not player:
        return
    await cm.game_manager.broadcast_in_game(
        db=db,
        game_id=player.game_id,
        message=serialize(
            {
                'type': 'winner',
                'playerId': winner_id,
                'playerName': player.player_name,
            },
        ),
    )
