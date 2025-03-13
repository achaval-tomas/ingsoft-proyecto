from src.schemas.card_schemas import Coordinate


class MovementData:
    def __init__(self, clamps, target):
        self.clamps: bool = clamps
        self.target: Coordinate = target


movement_data = {
    'diagonal-adjacent': MovementData(clamps=False, target=(1, 1)),
    'diagonal-spaced': MovementData(clamps=False, target=(2, 2)),
    'l-ccw': MovementData(clamps=False, target=(2, 1)),
    'l-cw': MovementData(clamps=False, target=(1, 2)),
    'straight-adjacent': MovementData(clamps=False, target=(1, 0)),
    'straight-edge': MovementData(clamps=True, target=(5, 0)),
    'straight-spaced': MovementData(clamps=False, target=(2, 0)),
}


def rotate_movement(target: Coordinate, rot: str):
    x, y = target
    rots = {'r0': target, 'r90': (-y, x), 'r180': (-x, -y), 'r270': (y, -x)}
    return rots[rot]
