import { PlayerId } from "../domain/GameState";
import { httpServerUrl } from "./config";
import { get, post } from "./util";

type CreateGameResult = {
    type: "LobbyNotFound" | "NotOwner" | "NotEnoughPlayers" | "PlayerNotFound" | "Ok" | "Other";
    message: string;
};

export type JoinedGame = {
    id: string;
    name: string;
    playerCount: number;
}

async function getJoinedGames(playerId: string): Promise<JoinedGame[]> {
    const res = await get(`${httpServerUrl}/game?player_id=${playerId}`);

    if (!res.ok) {
        throw new Error("failed to fetch joined games");
    }

    return await res.json() as JoinedGame[];
}

async function createGame(
    playerId: string,
    lobbyId: string,
): Promise<CreateGameResult> {
    const res = await post(`${httpServerUrl}/game`, {
        player_id: playerId,
        lobby_id: lobbyId,
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

async function leaveGame(gameId: string, playerId: PlayerId) {
    return post(`${httpServerUrl}/game/${gameId}/leave`, { playerId });
}

async function sendChatMessage(gameId: string, playerId: PlayerId, message: string) {
    return post(`${httpServerUrl}/game/${gameId}/chat`, {
        player_id: playerId,
        message,
    });
}

const gameService = {
    getJoinedGames,
    createGame,
    leaveGame,
    sendChatMessage,
};

export default gameService;