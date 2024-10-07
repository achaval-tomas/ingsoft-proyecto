class MovementData:
    def __init__(self, clamps, target):
        self.clamps: bool = clamps
        self.target: tuple[int, int] = target


movement_data = {
    'diagonal-adjacent': MovementData(clamps=False, target=(1, 1)),
    'diagonal-spaced': MovementData(clamps=False, target=(2, 2)),
    'l-ccw': MovementData(clamps=False, target=(2, 1)),
    'l-cw': MovementData(clamps=False, target=(1, 2)),
    'straight-adjacent': MovementData(clamps=False, target=(1, 0)),
    'straight-edge': MovementData(clamps=True, target=(5, 0)),
    'straight-spaced': MovementData(clamps=False, target=(2, 0)),
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
