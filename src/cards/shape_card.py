from src.schemas.card_schemas import Coordinate

shape_data = {
    'c-0': [(0, 0), (0, 1), (0, 2), (1, 1), (2, 1)],
    'c-1': [(0, 1), (1, 1), (1, 0), (2, 0), (3, 0)],
    'c-2': [(0, 0), (1, 0), (2, 0), (2, 1), (3, 1)],
    'c-3': [(0, 1), (0, 2), (1, 0), (1, 1), (2, 0)],
    'c-4': [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0)],
    'c-5': [(0, 0), (0, 1), (0, 2), (1, 0), (2, 0)],
    'c-6': [(0, 1), (1, 1), (2, 1), (3, 0), (3, 1)],
    'c-7': [(0, 0), (1, 0), (2, 0), (3, 0), (3, 1)],
    'c-8': [(0, 1), (1, 0), (1, 1), (2, 1), (2, 2)],
    'c-9': [(0, 0), (0, 1), (1, 1), (2, 1), (2, 2)],
    'c-10': [(0, 1), (0, 2), (1, 0), (1, 1), (2, 1)],
    'c-11': [(0, 1), (0, 2), (1, 1), (2, 0), (2, 1)],
    'c-12': [(0, 1), (1, 1), (2, 0), (2, 1), (3, 1)],
    'c-13': [(0, 0), (1, 0), (2, 0), (2, 1), (3, 0)],
    'c-14': [(0, 0), (1, 0), (1, 1), (2, 0), (2, 1)],
    'c-15': [(0, 0), (0, 1), (1, 0), (2, 0), (2, 1)],
    'c-16': [(0, 1), (1, 0), (1, 1), (1, 2), (2, 1)],
    'c-17': [(0, 1), (1, 0), (1, 1), (2, 0), (2, 1)],
    'b-0': [(0, 0), (1, 0), (1, 1), (2, 1)],
    'b-1': [(0, 0), (0, 1), (1, 0), (1, 1)],
    'b-2': [(0, 1), (1, 0), (1, 1), (2, 0)],
    'b-3': [(0, 0), (1, 0), (1, 1), (2, 0)],
    'b-4': [(0, 1), (1, 1), (2, 0), (2, 1)],
    'b-5': [(0, 0), (1, 0), (2, 0), (3, 0)],
    'b-6': [(0, 0), (1, 0), (2, 0), (2, 1)],
}


def rotate_shape_data_90(data: list[Coordinate]):
    return [(-c[1], c[0]) for c in data]


def rotate_shape(data: list[Coordinate], r_amount: int):
    """Returns normalized data after r_amount of ccw rotations"""
    for _ in range(r_amount):
        data = rotate_shape_data_90(data=data)
    return normalize_shape(data)


def normalize_shape(shape: list[Coordinate]):
    min_x = min(s[0] for s in shape)
    min_y = min(s[1] for s in shape)

    new_shape = [(s[0] - min_x, s[1] - min_y) for s in shape]

    return new_shape
