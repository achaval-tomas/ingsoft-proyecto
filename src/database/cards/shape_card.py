from enum import Enum

class ShapeType(Enum):
    SQUARE = "square"
    T = "t"
    LINE_4 = "line-4"
    LINE_5 = "line-5"
    L_P = "l-p"
    LINE = "line"
    Z = "z"
    T_P = "t-p"

class ShapeCard:
    def __init__(self, shape : ShapeType):
        self.shape = shape
        self.isBlocked = False
        