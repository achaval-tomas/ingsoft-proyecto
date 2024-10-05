from enum import Enum


class ShapeType(Enum):
    B_0 = 'b-0'
    B_1 = 'b-1'
    B_2 = 'b-2'
    B_3 = 'b-3'
    B_4 = 'b-4'
    B_5 = 'b-5'
    B_6 = 'b-6'
    C_0 = 'c-0'
    C_1 = 'c-1'
    C_2 = 'c-2'
    C_3 = 'c-3'
    C_4 = 'c-4'
    C_5 = 'c-5'
    C_6 = 'c-6'
    C_7 = 'c-7'
    C_8 = 'c-8'
    C_9 = 'c-9'
    C_10 = 'c-10'
    C_11 = 'c-11'
    C_12 = 'c-12'
    C_13 = 'c-13'
    C_14 = 'c-14'
    C_15 = 'c-15'
    C_16 = 'c-16'
    C_17 = 'c-17'


class ShapeCard:
    def __init__(self, shape: ShapeType):
        self.shape = shape
        self.isBlocked = False
