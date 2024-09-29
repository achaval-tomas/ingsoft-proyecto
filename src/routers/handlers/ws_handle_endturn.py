from fastapi import Depends, HTTPException
from src.database.models import Player, Game
from src.database.crud.crud_player import get_player
from src.database.crud.crud_game import get_game, update_game_turn
from sqlalchemy.orm import Session
import  json, jsonpickle


def end_turn(player_id: str, db: Session):
  
    player = get_player(db=db, player_id=player_id)
    if not player:
        raise HTTPException(status_code = 404, detail = "Player not found.")
    
    game = get_game(db = db , player_id = player_id)
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")

    players_order = jsonpickle.loads(game.player_order)      
    current_turn = game.current_turn
    next_turn =  update_game_turn(db = db, game = game )
    game.current_turn = next_turn
    
    return json.dumps({
        "type": "turn-end",
        "playerId": players_order[current_turn]  
    })
