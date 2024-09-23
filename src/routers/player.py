from fastapi import FastAPI, APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.database.schemas import PlayerCreate
from src.database import crud
from src.database.session import get_db

app = FastAPI()
router = APIRouter()



@router.post("/player", status_code=201)
async def create_player(player: PlayerCreate, db: Session = Depends(get_db)):
    
    if not player.player_name:
        raise HTTPException(status_code=400, detail="Player name cannot be empty")
    

    new_player = crud.create_player(db = db,  player = player)
    
    
    return {"message": "Player created successfully", "player_id": new_player}