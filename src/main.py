from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import models
from src.database.db import engine
from src.routers.player import create_player_router
from src.routers.lobby import lobby_router
from src.routers.game import game_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(create_player_router)
app.include_router(lobby_router)
app.include_router(game_router)