from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_user import decode_player_id, get_player
from src.routers.helpers.connection_manager import game_manager
from src.schemas.player_schemas import WinnerMessageSchema


async def handle_announce_winner(user_id: str, winner_id: str, db: Session):
    player = get_player(player_id=winner_id, db=db)
    if not player:
        return

    await game_manager.broadcast_in_game(
        db=db,
        game_id=player.game_id,
        message=WinnerMessageSchema(
            playerId=decode_player_id(
                db=db,
                player_id=winner_id,
                user_id=user_id,
            ),
            playerName=player.player_name,
        ).model_dump_json(),
    )

    crud_game.delete_game(db=db, game_id=player.game_id)
