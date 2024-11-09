from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from src.schemas import card_schemas
from src.schemas.card_schemas import Coordinate
from src.schemas.message_schema import MessageSchema


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

    model_config = ConfigDict(from_attributes=True)


class PlayerBaseSchema(BaseModel):
    id: str
    roundOrder: int
    name: str
    shapeCardsInDeckCount: Optional[int] = None
    shapeCardsInHand: Optional[list[card_schemas.ShapeCardSchema]] = []


class SelfPlayerStateSchema(PlayerBaseSchema):
    movementCardsInHand: Optional[list[str]] = []


class OtherPlayersStateSchema(PlayerBaseSchema):
    movementCardsInHandCount: Optional[int] = None


class BoardStateSchema(BaseModel):
    tiles: list[str]
    blockedColor: Optional[str] = None


class TemporalMovementSchema(BaseModel):
    movement: str
    position: Coordinate
    rotation: str


class GameStateSchema(BaseModel):
    selfPlayerState: SelfPlayerStateSchema
    otherPlayersState: list[OtherPlayersStateSchema]
    boardState: BoardStateSchema
    turnStart: datetime
    currentRoundPlayer: int
    temporalMovements: Optional[list[TemporalMovementSchema]] = []


class GameStateMessageSchema(MessageSchema):
    gameState: GameStateSchema


class TurnEndedMessageSchema(MessageSchema):
    type: str = 'turn-ended'
    playerId: str
    newShapeCards: list[card_schemas.ShapeCardSchema]
    newMovementCards: Optional[list[str]] = []


class ChatMessage(BaseModel):
    player_id: str
    msg: str
