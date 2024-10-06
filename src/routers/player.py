from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.crud import crud_player
from src.database.session import get_db
from src.schemas import player_schemas

create_player_router = APIRouter()


@create_player_router.post('/player', status_code=201)
async def create_player(
    player: player_schemas.PlayerCreate,
    db: Session = Depends(get_db),
):
    if not player.player_name:
        raise HTTPException(status_code=400, detail='Player name cannot be empty')

    return {
        'player_id': crud_player.create_player(db=db, player=player),
    }
