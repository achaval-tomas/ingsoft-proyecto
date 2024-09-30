from fastapi import Depends, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.database import schemas
from src.database.session import get_db
from src.routers.handlers.ws_handle_game_start import ws_handle_game_start
from src.routers.handlers.ws_handle_gamestate import ws_handle_gamestate
import src.routers.helpers.connection_manager as cm
from src.database.crud import crud_game, crud_lobby


game_router = APIRouter()

@game_router.post("/game", status_code=200)
async def start_game(body: schemas.GameCreate, db: Session = Depends(get_db)):
    rc = crud_game.create_game(db=db, lobby_id=body.lobby_id, player_id=body.player_id)
    if rc == 1:
        raise HTTPException(status_code=400, detail="You must be the game owner to start it")
    elif rc == 2:
        raise HTTPException(status_code=404, detail="Lobby not found")
    await ws_handle_game_start(lobby_id=body.lobby_id)
    crud_lobby.delete_lobby(lobby_id=body.lobby_id, db=db)

@game_router.websocket("/game/{player_id}")
async def game_websocket(player_id: str, ws: WebSocket, db: Session = Depends(get_db)):
    await cm.game_manager.connect(ws, player_id)
    try:
        while True:
            response = ""
            request = await ws.receive_text()
            match request:
                case 'get-game-state':
                    response = ws_handle_gamestate(player_id=player_id, db=db)
                case 'end-turn':
                    pass
                    # there should be a handler that returns a game_id and body
                    # to broadcast through the manager
            if response != "":
                await cm.game_manager.send_personal_message(websocket=ws, message=response)
    except WebSocketDisconnect:
        cm.game_manager.disconnect(player_id=player_id)
        return
 
        
            
        
    
    
    
    