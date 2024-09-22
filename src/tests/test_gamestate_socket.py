from fastapi import FastAPI, responses

app = FastAPI()

def html(id: int): 
    return f"""
        <!DOCTYPE html>
        <html>
            <head>
                <title>El Switcher</title>
            </head>
            <body>
                <h1>Lobby Data</h1>
                <ul id='lobby-data'>
                </ul>
                <script>
                    var ws = new WebSocket("ws://localhost:8000/lobby/{id}/ws")
                    ws.onmessage = function(event) {{
                        var data = JSON.parse(event.data)
                        var list = document.getElementById('lobby-data')
                        var room = document.createElement('li')
                        room.innerHTML = "Nombre de sala: " + data.name
                        list.appendChild(room)
                        var currentPlayer = document.createElement('li')
                        currentPlayer.innerHTML = "Turno Actual: " + data.current_player
                        list.appendChild(currentPlayer)
                    }}
                </script>
            </body>
        </html>
        """

@app.get("/lobby/{id}")
async def get(id: int):
    return responses.HTMLResponse(html(id))

from src.websockets.gamestate_socket import gamestateWS
app.include_router(gamestateWS)