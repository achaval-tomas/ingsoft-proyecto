from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_user import (
    delete_active_player,
    get_active_player_id_from_game,
)
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.player_schemas import PlayerMessageSchema


async def handle_leave_game(player_id: str, game_id: str, db: Session):
    subplayer_id = get_active_player_id_from_game(db, player_id, game_id)
    if not subplayer_id:
        return 2

    res, winner_id = crud_game.leave_game(db=db, player_id=subplayer_id)
    delete_active_player(db, player_id, subplayer_id)

    if res == 0 or res == 3:
        await game_manager.broadcast_in_game(
            db=db,
            game_id=game_id,
            message=PlayerMessageSchema(
                type='player-left',
                playerId=subplayer_id,
            ).model_dump_json(),
        )
        if res == 3:
            await handle_announce_winner(db=db, winner_id=winner_id)
        return 0

    return res
