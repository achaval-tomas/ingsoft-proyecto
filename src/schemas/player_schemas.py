from pydantic import BaseModel, ConfigDict

from src.schemas.message_schema import MessageSchema


class PlayerBase(BaseModel):
    player_name: str


class PlayerId(BaseModel):
    """camelCase to receive from frontend"""

    playerId: str


class PlayerIdSchema(BaseModel):
    player_id: str


class PlayerCreateSchema(PlayerBase):
    pass


class PlayerSchema(PlayerBase):
    player_id: str
    game_id: str
    lobby_id: str

    model_config = ConfigDict(from_attributes=True)


class PlayerInfoSchema(BaseModel):
    id: str
    name: str


class PlayerListMessageSchema(BaseModel):
    type: str = 'player-list'
    players: list[PlayerInfoSchema]


class PlayerMessageSchema(MessageSchema, PlayerId):
    pass


class WinnerMessageSchema(PlayerId):
    type: str = 'player-won'
    playerName: str
