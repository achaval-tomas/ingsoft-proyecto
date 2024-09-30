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

def test_create_player_br():
    
    player_data = PlayerCreate(player_name = "")
    response = client.post("/player",json=player_data.model_dump())
    
    assert response.status_code == 400
    data = response.json()
    # verify that the id was not created
    assert not "player_id" in data
    

def test_create_game():
   
    player_test = PlayerCreate(player_name="TestGame")
    player_test_id = client.post("/player", json=player_test.model_dump())
    print("Respuesta de creación de jugador:", player_test_id.json())

    # Verificar que la respuesta contenga el 'player_id'
    player_test_json = player_test_id.json()
    assert "player_id" in player_test_json, "El 'player_id' no se encuentra en la respuesta del servidor"
    player_id = player_test_json['player_id']
    print("player_id:", player_id)

    # Crear un lobby con el player_id obtenido
    lobby_test = LobbyCreate(
        lobby_name="LobbyTest",
        lobby_owner=player_id,
        min_players=0,
        max_players=4
    )
    print("Datos del lobby antes de enviarse:", lobby_test.model_dump())
    lobby_test_id = client.post("/lobby", json=lobby_test.model_dump())
    print("Respuesta de creación de lobby:", lobby_test_id.json())

    # Verificar que la respuesta contenga el 'lobby_id'
    lobby_json = lobby_test_id.json()
    assert "lobby_id" in lobby_json, "El 'lobby_id' no se encuentra en la respuesta del servidor"
    lobby_id = lobby_json['lobby_id']
    print("lobby_id:", lobby_id)

    # Crear el objeto Game
    game_test = GameCreate(lobby_id=lobby_id, player_id=player_id)
    print("Datos de GameCreate enviados:", game_test.model_dump())

    # Hacer la solicitud POST a /game
    response = client.post("/game", json=game_test.model_dump())
    print("Respuesta de creación de game:", response.json())
    print("Código de estado:", response.status_code)

    # Verificar que la respuesta tenga un código de estado 200
    assert response.status_code == 200, f"Error en la creación del juego, se recibió {response.status_code} en lugar de 200"








