from fastapi import FastAPI
from  src.routers import player
from src.database import models
from src.database.db import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(player.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

