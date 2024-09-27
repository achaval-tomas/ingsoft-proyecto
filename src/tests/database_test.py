from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from src.database import models, schemas, crud
from src.database.session import get_db
from src.database.db import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    # If there was the possibility to create duplicates, it should be checked
    # here and handled with HTTP exceptions.
    return crud.create_lobby(db=db, lobby=lobby)

@app.post("/lobby/{lobby_id}/delete")
def delete_lobby(lobby_id: str, db: Session = Depends(get_db)):
    # If there was the possibility to create duplicates, it should be checked
    # here and handled with HTTP exceptions.
    return crud.delete_lobby(db=db,lobby_id=lobby_id)

@app.post("/game/{id}")
def initialize_game(id: str, db: Session = Depends(get_db)):
    return crud.create_game(db=db, lobby_id=id)

@app.post("/player")
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    if not player.player_name:
        raise HTTPException(status_code=400, detail="Player name cannot be empty")
    
    return {"player_id": crud.create_player(db = db, player = player)}

@app.get("/player/{id}")
def get_player(id: str, db: Session = Depends(get_db)):
    return crud.get_player(db=db, player_id=id)