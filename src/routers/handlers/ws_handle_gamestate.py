from sqlalchemy.orm import Session
from src.database.crud import get_game, get_player, get_player_cards
import json, jsonpickle
from src.database.models import Game
# for testing, from src.database.crud import create_game

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
    other_players = [player for player in json.loads(game_data.player_order) if player != player_id]
    for op_id in other_players:
        commonPlayerState = {
            'id': op_id,
            'roundOrder': json.loads(game_data.player_order).index(op_id),
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
    # for testing: create_game(db=db, lobby_id='816fc395-91ed-4340-bb18-e5296103b2b3')
    player_data = get_player(db=db, player_id=player_id)
    if not player_data:
        return json.dumps({"Error": "404 Player Not Found"})
    game_data = get_game(db=db, player_id=player_id)
    if not game_data:
        return json.dumps({"Error": "404 Game Not Found"})
    
    selfPlayerState = {
        'id': player_id,
        'roundOrder': json.loads(game_data.player_order).index(player_id),
        'name': player_data.player_name
    }
    selfPlayerState.update(extract_cards(db, player_id))
    
    boardState = {
        'tiles': json.loads(game_data.board),
        'blockedColor': game_data.blocked_color
    }
    
    otherPlayersState = extract_other_player_states(db, game_data, player_id)
    
    return json.dumps({
        'messageType': 'gamestate',
        'selfPlayerState': selfPlayerState,
        'otherPlayersState': otherPlayersState,
        'boardState': boardState,
        'turnStart': 0,
        'currentRoundPlayer': game_data.current_turn,
    })