from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.database.crud.tools.jsonify import serialize


async def ws_handle_game_start(lobby_id: str, db: Session):
    await cm.lobby_manager.broadcast_in_lobby(
        db=db,
        lobby_id=lobby_id,
        message=serialize(
            {
                'type': 'game-started',
            },
        ),
    )
