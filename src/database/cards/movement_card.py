from enum import Enum

class MovementType(Enum):
    DIAGONAL_ADJACENT = "diagonal-adjacent"
    DIAGONAL_SPACED = "diagonal-spaced"
    L_CCW = "l-ccw"
    L_CW = "l-cw"
    STRAIGHT_ADJACENT = "straight-adjacent"
    STRAIGHT_EDGE = "straight-edge"
    STRAIGHT_SPACED = "straight-spaced"

class MovementCard:
    def __init__(self, mov_type : MovementType):
        self.mov_type = mov_type