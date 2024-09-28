from sqlalchemy.orm import Session
from src.database.crud import get_game, create_game
import json

def ws_handle_gamestate(player_id: str, db: Session):
    # Will remove this
    create_game(db=db, lobby_id='0abcec10-df01-4505-ba2a-d412dfbd0791')
    game_data = get_game(db=db, player_id=player_id)
    # Missing player_cards data
    return json.dumps({
        'player_order': game_data.player_order,
        'current_turn': game_data.current_turn,
        'blocked_color': game_data.blocked_color,
        'board': game_data.board
    })