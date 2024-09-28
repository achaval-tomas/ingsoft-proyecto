from fastapi import Depends, APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.database.session import get_db
from src.routers.handlers.ws_handle_gamestate import ws_handle_gamestate

game_ws = APIRouter()

@game_ws.websocket("/game/{player_id}")
async def game_websocket(player_id: str, ws: WebSocket, db: Session = Depends(get_db)):
    await ws.accept()
    try:
        while True:
            response = ""
            request = await ws.receive_text()
            match request:
                case 'gamestate':
                    response = ws_handle_gamestate(player_id=player_id, db=db)
            if response != "":
                await ws.send_text(response)
    except WebSocketDisconnect:
        return
 
        
            
        
    
    
    
    