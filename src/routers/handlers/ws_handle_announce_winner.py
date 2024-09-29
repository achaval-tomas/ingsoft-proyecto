from sqlalchemy.orm import Session
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize
import src.routers.helpers.connection_manager as cm

async def ws_handle_announce_winner(player_id: str, db: Session):
    player = get_player(player_id=player_id, db=db)
    if not player:
        return
    await cm.game_manager.broadcast_in_game(
        db=db,
        game_id=player.game_id,
        message=serialize({
            'type': 'winner',
            'playerId': player_id,
            'playerName': player.player_name
        })
    )
