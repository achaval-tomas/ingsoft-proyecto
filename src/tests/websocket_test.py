from fastapi import FastAPI, responses
from src.database import models
from src.database.db import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def html(player_id: str): 
    return f"""
        <!DOCTYPE html>
        <html>
            <head>
                <title>El Switcher</title>
            </head>
            <body>
                <h1>Websocket Test</h1>
                <form action="" onsubmit="sendMessage(event)">
                    <input type="text" id="messageText" autocomplete="off"/>
                    <button>Send</button>
                </form>
                <ul id='display-data'>
                </ul>
                <script>
                    var ws = new WebSocket("ws://localhost:8000/lobby/{player_id}")
                    ws.onmessage = function(event) {{
                        var data = JSON.parse(event.data)
                        console.log(data)
                    }}
                    function sendMessage(event) {{
                        var input = document.getElementById("messageText")
                        ws.send(input.value)
                        input.value = ''
                        event.preventDefault()
                    }}
                </script>
            </body>
        </html>
        """

@app.get("/lobby/{id}")
async def get(id: str):
    return responses.HTMLResponse(html(id))

from src.routers.player import create_player_router
from src.routers.lobby import create_lobby_router, join_lobby_router, lobby_ws
from src.routers.game import game_ws
app.include_router(create_player_router)
app.include_router(create_lobby_router)
app.include_router(join_lobby_router)
app.include_router(game_ws)
app.include_router(lobby_ws)