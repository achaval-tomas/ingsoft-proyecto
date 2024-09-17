from fastapi import FastAPI, APIRouter

from src.models.lobby import Lobby
from  src.models.player import Player

router = APIRouter()

@router.post("/lobby")
async def create_lobby(body : Lobby):

    return body