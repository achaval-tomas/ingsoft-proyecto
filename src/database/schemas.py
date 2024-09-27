from pydantic import BaseModel

''' PLAYER DATABASE SCHEMAS '''
class PlayerBase(BaseModel):
    player_name: str

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    player_id: str
    
    class Config:
        orm_mode = True

''' LOBBY DATABASE SCHEMAS '''
class LobbyBase(BaseModel):
    lobby_name: str
    lobby_owner: str
    min_players: int
    max_players: int

class LobbyCreate(LobbyBase):
    pass

class Lobby(LobbyBase):
    lobby_id: str
    player_amount: int
    players: list[str]

    class Config:
        orm_mode = True

''' GAME DATABASE SCHEMAS '''
class GameBase(BaseModel):
    player_order: list[str]
    current_player: str
    board: list[str]
    blocked_color: str

class Game(GameBase):
    lobby_id: str

    class Config:
        orm_mode = True

''' GAME DATABASE SCHEMAS '''
class GameBase(BaseModel):
    player_order: list[str]
    current_player: str
    board: list[str]
    blocked_color: str

class Game(GameBase):
    lobby_id: str

    class Config:
        orm_mode = True

class LobbyJoin(BaseModel):
    player_id: str
    lobby_id: str