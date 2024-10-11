from pydantic import BaseModel

from src.tools.jsonify import deserialize, serialize


class ShapeCardSchema(BaseModel):
    shape: str
    isBlocked: bool


def dump_shape_cards(cards: list[ShapeCardSchema]):
    return serialize([s.model_dump_json() for s in cards])


def validate_shape_cards(cards: str):
    return [ShapeCardSchema.model_validate_json(s) for s in deserialize(cards)]


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
