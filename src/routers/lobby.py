from fastapi import Depends, FastAPI, APIRouter, HTTPException
from sqlalchemy.orm import Session
from src.database import models, schemas, crud
from src.database.session import get_db
from src.database.db import engine


router = APIRouter()


@router.post("/lobby")
def create_lobby(lobby: schemas.LobbyCreate, db: Session = Depends(get_db)):
    
    return crud.create_lobby(db=db, lobby=lobby)
