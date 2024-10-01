from sqlalchemy.orm import Session
from src.database.crud.crud_player import get_player, get_player_cards
from src.database.crud.crud_game import get_game
import jsonpickle
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Game

def extract_cards(db : Session, player_id : str):
    player_cards = get_player_cards(db=db, player_id=player_id)
    shape_cards_in_hand = [{
            'shape': card['shape']['_value_'],
            'isBlocked': card['isBlocked']
        }
        for card in jsonpickle.loads(player_cards.shape_cards_in_hand)
    ]
    movement_cards_in_hand = [
        card['mov_type']['_value_'] for card in jsonpickle.loads(player_cards.movement_cards)
    ]
    return {
        'shapeCardsInDeckCount' : len(jsonpickle.loads(player_cards.shape_cards_deck)),
        'shapeCardsInHand': shape_cards_in_hand,
        'movementCardsInHand': movement_cards_in_hand
    }

def extract_other_player_states(db: Session, game_data: Game, player_id: str):
    other_players_state = []
    other_players = [player for player in deserialize(game_data.player_order) if player != player_id]
    for op_id in other_players:
        commonPlayerState = {
            'id': op_id,
            'roundOrder': deserialize(game_data.player_order).index(op_id),
            'name': get_player(db=db, player_id=op_id).player_name
        }
        cards = extract_cards(db, op_id)
        cards.update({
            'movementCardsInHandCount': len(cards['movementCardsInHand'])
        })
        del cards['movementCardsInHand']
        commonPlayerState.update(cards)
        other_players_state.append(commonPlayerState)
    return other_players_state
        
    

def ws_handle_gamestate(player_id: str, db: Session):
    player_data = get_player(db=db, player_id=player_id)
    if not player_data:
        return serialize({
            'type': 'error',
            "message": "Player Not Found"
        })
    game_data = get_game(db=db, player_id=player_id)
    if not game_data:
        return serialize({
            'type': 'error',
            "message": "Game Not Found"
        })
    
    selfPlayerState = {
        'id': player_id,
        'roundOrder': deserialize(game_data.player_order).index(player_id),
        'name': player_data.player_name
    }
    selfPlayerState.update(extract_cards(db, player_id))
    
    boardState = {
        'tiles': deserialize(game_data.board),
        'blockedColor': game_data.blocked_color
    }
    
    otherPlayersState = extract_other_player_states(db, game_data, player_id)
    
    return serialize({
        'type': 'game-state',
        'gameState': {
            'selfPlayerState': selfPlayerState,
            'otherPlayersState': otherPlayersState,
            'boardState': boardState,
            'turnStart': 0,
            'currentRoundPlayer': game_data.current_turn
        }
    })