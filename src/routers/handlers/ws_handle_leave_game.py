from sqlalchemy.orm import Session
from src.database.crud import crud_game
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize
import src.routers.helpers.connection_manager as cm

async def ws_handle_leave_game(player_id: str, db: Session):
    player = get_player(player_id=player_id, db=db)
    if not player:
        return 2
    game_id = player.game_id
    res = crud_game.leave_game(db=db, player_id=player_id)
    if res:
        await cm.game_manager.broadcast_in_game(
            db=db,
            game_id=game_id,
            message=serialize({
                'type': 'player-left',
                'playerId': player_id
            })
        )
    return res