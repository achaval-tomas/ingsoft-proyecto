import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from src.database.schemas import LobbyCreate, PlayerCreate, GameCreate
from src.database import models
from src.main import app

client = TestClient(app)

def test_create_player():
    
    player_data = PlayerCreate(player_name = "Test Player")
    response = client.post("/player",json=player_data.model_dump())
    
    assert response.status_code == 201
    # verify that the id was created
    data = response.json()
    assert "player_id" in data
