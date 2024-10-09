from src.cards.shape_card import normalize_shape, rotate_shape, shape_data
from src.schemas.card_schemas import ShapeCardSchema


def get_coord_from_board_index(index: int):
    return (index % 6, index // 6)


def get_board_index_from_coords(coords: tuple[int, int]):
    return coords[1] * 6 + coords[0]


def find_connected_tiles(board: list[str], start_index: int):
    target_color = board[start_index]

    visited = [False] * 36
    queue = [start_index]
    selected: list[int] = []

    while len(queue) != 0:
        tile_index = queue.pop(0)

        if visited[tile_index]:
            continue
        visited[tile_index] = True

        tile_color = board[tile_index]

        if tile_color != target_color:
            continue
        selected.append(tile_index)

        (x, y) = get_coord_from_board_index(tile_index)

        if x > 0:
            queue.append(get_board_index_from_coords((x - 1, y)))
        if x < 5:
            queue.append(get_board_index_from_coords((x + 1, y)))
        if y > 0:
            queue.append(get_board_index_from_coords((x, y - 1)))
        if x < 5:
            queue.append(get_board_index_from_coords((x, y + 1)))

    return list(map(get_coord_from_board_index, selected))


def match_shape_to_player_card(
    shape_cards: list[ShapeCardSchema],
    target_shape: list[tuple[int, int]],
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
