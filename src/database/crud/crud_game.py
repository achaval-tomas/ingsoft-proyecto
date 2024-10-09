import random

from sqlalchemy.orm import Session

from src.database.crud import crud_cards
from src.database.crud.crud_lobby import get_lobby
from src.database.crud.crud_player import get_player
from src.database.crud.tools.jsonify import deserialize, serialize
from src.database.models import Game, Lobby, PlayerCards


def create_game(db: Session, lobby_id: str, player_id: str):
    """
    Handles the initial setup of a game, including
    board randomization and handing cards.
    """
    # obtain the lobby from where the game was started
    lobby: Lobby = get_lobby(db=db, lobby_id=lobby_id)
    if lobby is None:
        return 1
    if lobby.lobby_owner != player_id:
        return 2

    # create a list with the players in the lobby but randomly shuffled
    player_order = deserialize(lobby.players)
    if len(player_order) < lobby.min_players:
        return 3
    random.shuffle(player_order)

    # the first turn will go to the first player in the shuffled list
    current_turn = 0

    # create the board
    colors = ['green', 'blue', 'yellow', 'red']
    board = colors * 9

    # randomize the board
    random.shuffle(board)

    # create game
    db_game = Game(
        player_order=serialize(player_order),
        current_turn=current_turn,
        board=serialize(board),
        blocked_color=None,
    )

    db.add(db_game)
    db.commit()
    db.refresh(db_game)

    game_id = db_game.game_id
    for id in player_order:
        player = get_player(db=db, player_id=id)
        if player is None:
            return 4

        player.game_id = game_id
        db.commit()

    # Already verified player_order contains only valid players
    crud_cards.hand_all_initial_cards(db=db, players=player_order)

    return 0


def swap_tiles(
    db: Session,
    game: Game,
    origin: tuple[int, int],
    target: tuple[int, int],
    clamp: bool,
):
    board_origin = origin[1] * 6 + origin[0]
    if not 0 <= board_origin < 36:
        return 1

    target_x = origin[0] + target[0]
    target_y = origin[1] + target[1]

    if clamp:
        target_x = clamp_val(target_x)
        target_y = clamp_val(target_y)

    board_target = target_y * 6 + target_x

    if not 0 <= board_target < 36 or board_origin == board_target:
        return 1

    board = deserialize(game.board)
    board[board_origin], board[board_target] = board[board_target], board[board_origin]

    game.board = serialize(board)
    db.commit()

    return 0


def clamp_val(val: int):
    """Clamps a value to the range [0,5] (valid board coordinate)"""
    return max(0, min(val, 5))


def get_game(db: Session, player_id: str):
    player = get_player(db=db, player_id=player_id)
    if not player:
        return None
    return db.query(Game).filter(Game.game_id == player.game_id).one_or_none()


def get_game_players(db: Session, game_id: int):
    game = db.query(Game).filter(Game.game_id == game_id).one_or_none()
    if game is None:
        return []
    return deserialize(game.player_order)


def leave_game(db: Session, player_id: str):
    """
    Remove player_id from the game they're currently playing.

    Return format:
        code, winner_id | None
    Return codes:
        0 -> Player succesfully left the game
        1 -> Player is not currently in a game
        2 -> Player does not exist in the database
        3 -> There is a winner (winner_id) because everyone else left
    """
    game = get_game(db=db, player_id=player_id)
    if not game:
        return 1, None

    # Get player order array
    players = deserialize(game.player_order)

    # Get next player if player with current turn is leaving
    current_player = players[game.current_turn]
    current_turn = (
        (game.current_turn + 1) % len(players)
        if current_player == player_id
        else game.current_turn
    )
    new_current_player = players[current_turn]

    # Remove player from player order array
    players.remove(player_id)
    game.player_order = serialize(players)

    # Update current turn to match new_current_player
    game.current_turn = players.index(new_current_player)
    db.commit()

    player = get_player(db=db, player_id=player_id)
    if not player:
        return 2, None

    player.game_id = None
    db.commit()

    delete_player_cards(db=db, player_id=player_id)

    if len(players) == 1:
        return 3, players[0]

    return 0, None


def delete_game(db: Session, game_id: str):
    query = db.query(Game).filter(Game.game_id == game_id)
    game = query.one_or_none()
    if not game:
        return

    for player_id in deserialize(game.player_order):
        db_player = get_player(db=db, player_id=player_id)

        if not db_player:
            continue

        delete_player_cards(db=db, player_id=player_id)
        db_player.game_id = None
        db.commit()

    query.delete()
    db.commit()


def delete_player_cards(db: Session, player_id: str):
    db.query(PlayerCards).filter(PlayerCards.player_id == player_id).delete()
    db.commit()


def end_game_turn(db: Session, player_id: str):
    game = get_game(db=db, player_id=player_id)
    if not game:
        return 1

    player_order = deserialize(game.player_order)
    if player_id != player_order[game.current_turn]:
        return 2

    rc = crud_cards.cancel_movements(db=db, player_id=player_id)
    if rc == 1:
        return 3

    rc = crud_cards.refill_cards(db=db, player_id=player_id)
    if rc == 3:
        return 4

    game.current_turn = (game.current_turn + 1) % len(player_order)
    db.commit()

    return 0
