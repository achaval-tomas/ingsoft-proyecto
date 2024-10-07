from enum import Enum


class MovementType(Enum):
    DIAGONAL_ADJACENT = 'diagonal-adjacent'
    DIAGONAL_SPACED = 'diagonal-spaced'
    L_CCW = 'l-ccw'
    L_CW = 'l-cw'
    STRAIGHT_ADJACENT = 'straight-adjacent'
    STRAIGHT_EDGE = 'straight-edge'
    STRAIGHT_SPACED = 'straight-spaced'


class MovementData:
    def __init__(self, clamps, target):
        self.clamps: bool = clamps
        self.target: tuple[int, int] = target


movement_data = {
    MovementType.DIAGONAL_ADJACENT: MovementData(clamps=False, target=(1, 1)),
    MovementType.DIAGONAL_SPACED: MovementData(clamps=False, target=(2, 2)),
    MovementType.L_CCW: MovementData(clamps=False, target=(2, 1)),
    MovementType.L_CW: MovementData(clamps=False, target=(1, 2)),
    MovementType.STRAIGHT_ADJACENT: MovementData(clamps=False, target=(1, 0)),
    MovementType.STRAIGHT_EDGE: MovementData(clamps=True, target=(5, 0)),
    MovementType.STRAIGHT_SPACED: MovementData(clamps=False, target=(2, 0)),
}
