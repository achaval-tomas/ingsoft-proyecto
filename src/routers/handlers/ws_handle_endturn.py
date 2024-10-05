from sqlalchemy.orm import Session

import src.routers.helpers.connection_manager as cm
from src.database.crud.crud_game import end_game_turn
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import serialize


async def ws_handle_endturn(player_id: str, db: Session):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return serialize(
            {
                'type': 'error',
                'message': 'El jugador que solicitó abandonar no existe',
            },
        )

    res = end_game_turn(db=db, player_id=player_id)

    if res == 0:
        await cm.game_manager.broadcast_in_game(
            game_id=player.game_id,
            db=db,
            message=serialize(
                {
                    'type': 'turn-ended',
                    'playerId': player_id,
                },
            ),
        )
    elif res == 1:
        return serialize(
            {
                'type': 'error',
                'message': 'El jugador no está en una partida',
            },
        )
    elif res == 2:
        return serialize(
            {
                'type': 'error',
                'message': 'Debes esperar a que sea tu turno!',
            },
        )
    return ''
