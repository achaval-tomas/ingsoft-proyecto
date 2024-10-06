import { PlayerId } from "../domain/GameState";
import { httpServerUrl } from "./config";

type CreateGameResult = {
    type: "LobbyNotFound" | "NotOwner" | "NotEnoughPlayers" | "PlayerNotFound" | "Ok" | "Other";
    message: string;
};

async function createGame(
    playerId: string,
    lobbyId: string,
): Promise<CreateGameResult> {
    const res = await fetch(`${httpServerUrl}/game`, {
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

    if (res.ok) {
        return { type: "Ok", message: "" };
    }

    const json = await res.json() as { detail: string };

    if (res.status === 404 && json.detail === "No se pudo encontrar a uno de los jugadores") {
        return { type: "PlayerNotFound", message: json.detail };
    }

    if (res.status === 404 && json.detail === "No se pudo encontrar la sala deseada") {
        return { type: "LobbyNotFound", message: json.detail };
    }

    if (res.status === 400 && json.detail === "Debes ser el creador de la sala para realizar esta acción!") {
        return { type: "NotOwner", message: json.detail };
    }

    if (res.status === 400 && json.detail === "No hay suficientes jugadores para empezar. Espera a que se unan más!") {
        return { type: "NotEnoughPlayers", message: json.detail };
    }

    return { type: "Other", message: "Hubo un error en el tu pedido" };
}

async function leaveGame(playerId: PlayerId) {
    return fetch(`${httpServerUrl}/game/leave`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
    });
}

const gameService = {
    createGame,
    leaveGame,
};

export default gameService;