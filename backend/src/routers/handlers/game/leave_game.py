from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_user import delete_active_player, get_player
from src.routers.handlers.game.announce_winner import handle_announce_winner
from src.routers.helpers.connection_manager import game_manager
from src.schemas.player_schemas import PlayerMessageSchema
from src.tools.jsonify import deserialize


async def handle_leave_game(user_id: str, player_id: str, game_id: str, db: Session):
    res, winner_id = crud_game.leave_game(db=db, player_id=player_id)

    if res != 0 and res != 3:
        return res

    game = crud_game.get_game(db, game_id)
    if not game:
        return 2

    for id in deserialize(game.player_order):
        player = get_player(db, id)
        if player:
            await game_manager.send_personal_message(
                player_id=id,
                message=PlayerMessageSchema(
                    type='player-left',
                    playerId=user_id if id == player_id else player_id,
                ).model_dump_json(),
            )
    delete_active_player(db, user_id, player_id)

    if res == 3:
        await handle_announce_winner(db=db, winner_id=winner_id)

    return 0
