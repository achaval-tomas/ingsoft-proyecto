from pydantic import BaseModel, ConfigDict


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

    model_config = ConfigDict(from_attributes=True)
