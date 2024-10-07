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
    MovementType.DIAGONAL_ADJACENT.value: MovementData(clamps=False, target=(1, 1)),
    MovementType.DIAGONAL_SPACED.value: MovementData(clamps=False, target=(2, 2)),
    MovementType.L_CCW.value: MovementData(clamps=False, target=(2, 1)),
    MovementType.L_CW.value: MovementData(clamps=False, target=(1, 2)),
    MovementType.STRAIGHT_ADJACENT.value: MovementData(clamps=False, target=(1, 0)),
    MovementType.STRAIGHT_EDGE.value: MovementData(clamps=True, target=(5, 0)),
    MovementType.STRAIGHT_SPACED.value: MovementData(clamps=False, target=(2, 0)),
}


def rotate_movement(target: tuple[int, int], rot: str):
    match rot:
        case 'r0':
            pass
        case 'r90':
            return (-target[1], target[0])
        case 'r180':
            return (-target[0], -target[1])
        case 'r270':
            return (target[1], -target[0])
    return target
