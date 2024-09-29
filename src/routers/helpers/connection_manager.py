from fastapi import WebSocket
from sqlalchemy.orm import Session
from src.database.crud.crud_game import get_game_players

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    # accept websocket connection, added to active_connections
    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket

    # remove from list of connections
    def disconnect(self, player_id: str):
        del self.active_connections[player_id]

    # send message through a specific websocket
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    # broadcast a message to everyone (currently connected) in game #game_id
    async def broadcast_in_game(self, message: str, db: Session, game_id: int):
        game_players = get_game_players(db=db, game_id=game_id)
        connected_players = [player for player in game_players if player in self.active_connections.keys()]
        for player in connected_players:
            await self.active_connections[player].send_text(message)

manager = ConnectionManager()