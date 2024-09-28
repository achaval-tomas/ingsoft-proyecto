from fastapi import Depends, APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.database.session import get_db
from src.routers.handlers.ws_handle_gamestate import ws_handle_gamestate
from src.routers.helpers.connection_maneger import manager

game_ws = APIRouter()

@game_ws.websocket("/game/{player_id}")
async def game_websocket(player_id: str, ws: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(ws, player_id)
    try:
        while True:
            response = ""
            request = await ws.receive_text()
            match request:
                case 'gamestate':
                    response = ws_handle_gamestate(player_id=player_id, db=db)
                case 'end-turn':
                    pass
                    # there should be a handler that returns a game_id and body
                    # to broadcast through the manager
            if response != "":
                await manager.send_personal_message(websocket=ws, message=response)
    except WebSocketDisconnect:
        manager.disconnect(player_id=player_id)
        return
 
        
            
        
    
    
    
    