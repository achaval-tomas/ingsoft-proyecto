from fastapi import FastAPI, APIRouter
from pydantic import BaseModel

from src.models.lobby import Lobby
from  src.models.player import Player

router = APIRouter()

class Body(BaseModel):
    name : str
    min_players : int
    max_players : int

@router.post("/lobby")
async def create_lobby(body : Body):

    return body