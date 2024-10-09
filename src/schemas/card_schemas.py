from pydantic import BaseModel


class ShapeCardSchema(BaseModel):
    shape: str
    isBlocked: bool


class UseMovementCardSchema(BaseModel):
    type: str
    position: tuple[int, int]
    rotation: str
    movement: str


class MovementCardUsedSchema(BaseModel):
    type: str = 'movement-card-used'
    position: tuple[int, int]
    rotation: str
    movement: str


class UseShapeCardSchema(BaseModel):
    type: str
    position: tuple[int, int]
    targetPlayerId: str


class ShapeCardUsedSchema(BaseModel):
    type: str = 'shape-card-used'
    position: tuple[int, int]
    targetPlayerId: str
