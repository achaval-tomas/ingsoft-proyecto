from fastapi import WebSocket
from sqlalchemy.orm import Session
from src.database.crud import crud_game
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.tools.jsonify import deserialize

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    # accepts a websocket connection, saves it in active_connections
    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        if player_id in self.active_connections.keys():
            self.disconnect(player_id=player_id)
        self.active_connections[player_id] = websocket

    # removes a disconnected player from list of active connections
    def disconnect(self, player_id: str):
        del self.active_connections[player_id]

    # sends a message to a specific player
    async def send_personal_message(self, message: str, player_id: str):
        if player_id not in self.active_connections.keys():
            return
        await self.active_connections[player_id].send_text(message)

class GameConnectionManager(ConnectionManager):
    # broadcasts a message to everyone (currently connected) in a game
    async def broadcast_in_game(self, message: str, db: Session, game_id: int):
        game_players = crud_game.get_game_players(db=db, game_id=game_id)
        connected_players = [player for player in game_players if player in self.active_connections.keys()]
        for player in connected_players:
            await self.send_personal_message(message=message, player_id=player)
            
class LobbyConnectionManager(ConnectionManager):
    # broadcasts a message to everyone (currently connected) in a lobby
    async def broadcast_in_lobby(self, message: str, db: Session, lobby_id: int):
        lobby = get_lobby(db=db, lobby_id=lobby_id)
        if not lobby:
            return
        lobby_players = deserialize(lobby.players)
        connected_players = [player for player in lobby_players if player in self.active_connections.keys()]
        for player in connected_players:
            await self.send_personal_message(message=message, player_id=player)

game_manager = GameConnectionManager()
lobby_manager = LobbyConnectionManager()