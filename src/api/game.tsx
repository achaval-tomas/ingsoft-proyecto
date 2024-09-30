type CreateGameResult =
    | "Sala no encontrada"
    | "Jugador no encontrado"
    | "Ok"
    | "Solo el dueño de la sala puede iniciarlo"
    | "No se completó el mínimo de jugadores"

async function createGame(
    playerId: string,
    lobbyId: string,
): Promise<CreateGameResult | null> {
    const res = await fetch("http://127.0.0.1:8000/game", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            player_id: playerId,
            lobby_id: lobbyId,
        }),
    });

    if (res.ok)
        return "Ok";

    const json = await res.json() as { detail: string };

    if (res.status === 404 && json.detail === "Player not found") {
        return "Jugador no encontrado";
    }

    if (res.status === 404 && json.detail === "Lobby not found") {
        return "Sala no encontrada";
    }

    if (res.status === 400 && json.detail === "You must be the game owner to start it") {
        return "Solo el dueño de la sala puede iniciarlo";
    }

    if (res.status === 400 && json.detail === "Not enough players to start") {
        return "No se completó el mínimo de jugadores";
    }

    return null;
}

export { createGame };
