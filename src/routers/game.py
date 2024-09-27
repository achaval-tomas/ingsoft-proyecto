from fastapi import APIRouter, WebSocket
# from src.routers.handlers import ws_handle_code1, ws_handle_code2, ws_handle_code3
game_ws = APIRouter()

@game_ws.websocket("/game/{player_id}")
async def game_state_socket(player_id: int, websocket: WebSocket):
    await game_ws.accept()
    
''' Estructura pensada para esta funcion
    try:
        response = ""
        while True:
            request = await game_ws.receive_text()
            match request:
                case 'code1':
                    response = ws_handle_code1()
                case 'code2':
                    response = ws_handle_code2()
                case 'code3':
                    response = ws_handle_code3()
            if response is not "":
                await game_ws.send_text(response)
    except WebSocketDisconnect:
        await game_ws.send_text("WebSocket Connection Closed")
 
'''
        
            
        
    
    
    
    