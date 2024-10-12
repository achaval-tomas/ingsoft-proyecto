from src.cards.shape_card import normalize_shape, rotate_shape, shape_data
from src.schemas.card_schemas import Coordinate, ShapeCardSchema


def get_coord_from_board_index(index: int):
    return (index % 6, index // 6)


def get_board_index_from_coords(coords: Coordinate):
    return coords[1] * 6 + coords[0]


def get_board_neighbors(coord: Coordinate):
    (x, y) = coord
    neighbors: list[Coordinate] = []

    if x > 0:
        neighbors.append((x - 1, y))
    if x < 5:
        neighbors.append((x + 1, y))
    if y > 0:
        neighbors.append((x, y - 1))
    if y < 5:
        neighbors.append((x, y + 1))

    return neighbors


def find_connected_tiles(board: list[str], start_coords: Coordinate):
    target_color = board[get_board_index_from_coords(start_coords)]

    visited = [False] * 36
    queue: list[Coordinate] = [start_coords]
    selected: list[Coordinate] = []

    while len(queue) != 0:
        tile_coords = queue.pop(0)
        tile_index = get_board_index_from_coords(tile_coords)

        if visited[tile_index]:
            continue
        visited[tile_index] = True

        tile_color = board[tile_index]

        if tile_color != target_color:
            continue

        selected.append(tile_coords)
        queue += get_board_neighbors(tile_coords)

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
    normalized_shape = normalize_shape(target_shape)

    for s in shape_cards:
        rotations = [
            normalize_shape(
                rotate_shape(shape_data[s.shape], i),
            )
            for i in range(4)
        ]

        if any(set(normalized_shape) == set(rot) for rot in rotations):
            return s

    return None
