from fastapi import FastAPI, responses

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
                    var ws = new WebSocket("ws://localhost:8000/game/{player_id}")
                    ws.onmessage = function(event) {{
                        var data = JSON.parse(event.data)
                        var list = document.getElementById('display-data')
                        var res = document.createElement('li')
                        res.innerHTML = "player_order: " + data.player_order
                        list.appendChild(res)
                        var res2 = document.createElement('li')
                        res2.innerHTML = "current_turn: " + data.current_turn
                        list.appendChild(res2)
                        var res3 = document.createElement('li')
                        res3.innerHTML = "board: " + data.board
                        list.appendChild(res3)
                        var res4 = document.createElement('li')
                        res4.innerHTML = "blocked_color: " + data.blocked_color
                        list.appendChild(res4)
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
from src.routers.lobby import create_lobby_router, join_lobby_router
from src.routers.game import game_ws
app.include_router(create_player_router)
app.include_router(create_lobby_router)
app.include_router(join_lobby_router)
app.include_router(game_ws)