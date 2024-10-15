from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_player import get_player
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.player_schemas import PlayerMessageSchema


async def handle_leave_game(player_id: str, db: Session):
    player = get_player(player_id=player_id, db=db)
    if not player:
        return 2

    game_id = player.game_id
    res, winner_id = crud_game.leave_game(db=db, player_id=player_id)

    if res == 0 or res == 3:
        await game_manager.broadcast_in_game(
            db=db,
            game_id=game_id,
            message=PlayerMessageSchema(
                type='player-left',
                playerId=player_id,
            ).model_dump_json(),
        )
        if res == 3:
            await handle_announce_winner(db=db, winner_id=winner_id)
        return None

    return res
