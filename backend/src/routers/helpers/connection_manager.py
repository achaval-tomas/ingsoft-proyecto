from contextlib import suppress

from fastapi import WebSocket
from sqlalchemy.orm import Session

from src.database.crud import crud_game
from src.database.crud.crud_lobby import get_lobby
from src.tools.jsonify import deserialize


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        """accepts a websocket connection, saves it in active_connections"""
        await websocket.accept()

        if player_id in self.active_connections:
            self.active_connections[player_id].append(websocket)
        else:
            self.active_connections[player_id] = [websocket]

    def disconnect(self, player_id: str, websocket: WebSocket):
        """removes a disconnected websocket from list of active connections"""
        if player_id in self.active_connections:
            with suppress(ValueError):
                self.active_connections[player_id].remove(websocket)

            if not self.active_connections[player_id]:
                del self.active_connections[player_id]

    async def send_personal_message(self, message: str, player_id: str):
        """sends a message to a specific player"""
        if player_id not in self.active_connections:
            return

        for ws in self.active_connections[player_id]:
            await ws.send_text(message)


class GameConnectionManager(ConnectionManager):
    async def broadcast_in_game(self, message: str, db: Session, game_id: str):
        """broadcasts a message to everyone (currently connected) in a game"""
        game_players = crud_game.get_game_players(db=db, game_id=game_id)

        connected_players = [
            player for player in game_players if player in self.active_connections
        ]

        for player in connected_players:
            await self.send_personal_message(message=message, player_id=player)


class LobbyConnectionManager(ConnectionManager):
    async def broadcast_in_lobby(self, message: str, db: Session, lobby_id: int):
        """broadcasts a message to everyone (currently connected) in a lobby"""

        lobby = get_lobby(db=db, lobby_id=lobby_id)
        if not lobby:
            return

        lobby_players = deserialize(lobby.players)
        connected_players = [
            player for player in lobby_players if player in self.active_connections
        ]

        for player in connected_players:
            await self.send_personal_message(message=message, player_id=player)


game_manager = GameConnectionManager()
lobby_manager = LobbyConnectionManager()
