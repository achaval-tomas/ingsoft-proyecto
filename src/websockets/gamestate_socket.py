from fastapi import WebSocket, APIRouter
import json

lobby_data = [{'name': "Mauri's Game",
              'player_order': [24124, 5125, 12685, 9380],
              'current_player': 2
              },
              {'name': "Tomas's Game",
              'player_order': [124, 4241, 513],
              'current_player': 1
              },
              {'name': "Cande's Game",
              'player_order': [1521, 485, 546, 2352],
              'current_player': 0
              }]

gamestateWS = APIRouter()

@gamestateWS.websocket("/lobby/{id}/ws")
async def game_state_socket(id: int, websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text(json.dumps(lobby_data[id-1]))