from src.cards.shape_card import normalize_shape, rotate_shape, shape_data
from src.schemas.card_schemas import Coordinate, ShapeCardSchema


def index_to_coord(index: int):
    return (index % 6, index // 6)


def coord_to_index(coords: Coordinate):
    return coords[1] * 6 + coords[0]


def get_new_neighbors(coord: Coordinate, visited: list[int]):
    """Returns unvisited board neighbords of coord"""
    x, y = coord

    return [
        coord
        for cond, coord in [
            (x > 0, (x - 1, y)),
            (x < 5, (x + 1, y)),
            (y > 0, (x, y - 1)),
            (y < 5, (x, y + 1)),
        ]
        if cond and not visited[coord_to_index(coord)]
    ]


def find_connected_tiles(board: list[str], start_coords: Coordinate):
    target_color = board[coord_to_index(start_coords)]

    visited = [False] * 36
    queue: list[Coordinate] = [start_coords]
    selected: list[Coordinate] = []

    while queue:
        tile_coords = queue.pop(0)
        tile_index = coord_to_index(tile_coords)

        visited[tile_index] = True

        if board[tile_index] != target_color:
            continue

        selected.append(tile_coords)
        queue += get_new_neighbors(tile_coords, visited)

    return selected


def match_shape_to_player_card(
    shape_cards: list[ShapeCardSchema],
    target_shape: list[Coordinate],
):
    """
    Matches 'shape' to any rotation of a card
    in shape_cards according to shape_data.

    Returns the ShapeCardSchema that matched if any, else None.
    """
    normalized_shape = set(normalize_shape(target_shape))

    for s in shape_cards:
        rotations = [rotate_shape(shape_data[s.shape], i) for i in range(4)]

        if any(normalized_shape == set(rot) for rot in rotations):
            return s

    return None
