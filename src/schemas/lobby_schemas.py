from pydantic import BaseModel


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


class LobbyLeave(LobbyJoin):
    pass
