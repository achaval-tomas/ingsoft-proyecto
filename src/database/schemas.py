from pydantic import BaseModel

""" PLAYER DATABASE SCHEMAS """


class PlayerBase(BaseModel):
    player_name: str


class PlayerId(BaseModel):
    """camelCase to receive from frontend"""

    playerId: str


class PlayerCreate(PlayerBase):
    pass


class Player(PlayerBase):
    player_id: str
    game_id: str
    lobby_id: str

    class Config:
        orm_mode = True


""" LOBBY DATABASE SCHEMAS """


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


class LobbyJoin(BaseModel):
    player_id: str
    lobby_id: str


""" GAME DATABASE SCHEMAS """


class GameBase(BaseModel):
    player_order: list[str]
    current_player: int
    board: list[str]
    blocked_color: str


class GameCreate(BaseModel):
    lobby_id: str
    player_id: str


class Game(GameBase):
    game_id: int

    class Config:
        orm_mode = True
