from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_user import get_player
from src.routers.helpers.connection_manager import game_manager
from src.schemas.player_schemas import WinnerMessageSchema


async def handle_announce_winner(winner_id: str, db: Session):
    player = get_player(player_id=winner_id, db=db)
    if not player:
        return

    players = crud_game.get_game_players(db=db, game_id=player.game_id)
    for id in players:
        await game_manager.send_personal_message(
            player_id=id,
            message=WinnerMessageSchema(
                playerId=player.user_id if id == winner_id else winner_id,
                playerName=player.player_name,
            ).model_dump_json(),
        )

    crud_game.delete_game(db=db, game_id=player.game_id)
