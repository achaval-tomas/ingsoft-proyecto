from fastapi import APIRouter, HTTPException

from src.constants import errors
from src.database.crud import crud_player
from src.database.db import SessionDep
from src.schemas.player_schemas import PlayerCreateSchema, PlayerIdSchema

create_player_router = APIRouter()


@create_player_router.post(
    '/player',
    status_code=201,
    response_model=PlayerIdSchema,
)
async def create_player(player: PlayerCreateSchema, db: SessionDep):
    if not player.player_name:
        raise HTTPException(status_code=400, detail=errors.EMPTY_NAME)

    return PlayerIdSchema(
        player_id=crud_player.create_player(db=db, player=player),
    )
