from pydantic import BaseModel, ConfigDict


class LobbyBase(BaseModel):
    lobby_name: str
    lobby_owner: str
    min_players: int
    max_players: int


class LobbyCreate(LobbyBase):
    pass


class LobbyIdSchema(BaseModel):
    lobby_id: str


class LobbySchema(LobbyBase):
    lobby_id: str
    player_amount: int
    players: list[str]

    model_config = ConfigDict(from_attributes=True)


class LobbyJoin(BaseModel):
    player_id: str
    lobby_id: str


class LobbyLeave(LobbyJoin):
    pass
