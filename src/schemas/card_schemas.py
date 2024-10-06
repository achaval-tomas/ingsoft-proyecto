from pydantic import BaseModel


class ShapeCardSchema(BaseModel):
    shape: str
    isBlocked: bool
