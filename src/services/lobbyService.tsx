import { LobbyElement } from "../containers/MainPage/components/LobbyList";
import { httpServerUrl } from "./config";

async function getJoinableLobbies(): Promise<LobbyElement[]> {
    const res = await fetch(`${httpServerUrl}/lobby`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

    const data = await res.json() as LobbyElement[];

    return data.filter(l => l.max_players > l.player_amount);
}

async function createLobby(
    playerId: string,
    lobbyName: string,
    maxPlayers: number,
): Promise<string> {
    const res = await fetch(`${httpServerUrl}/lobby`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            lobby_name: lobbyName,
            lobby_owner: playerId,
            min_players: 2,
            max_players: maxPlayers,
        }),
    });

    const data = await res.json() as { lobby_id: string };
    return data.lobby_id;
}

type JoinLobbyResult = {
    type: "PlayerNotFound" | "LobbyNotFound" | "LobbyFull" | "AlreadyJoined" | "Ok" | "Other";
    message: string;
};

async function joinLobby(playerId: string, lobbyId: string): Promise<JoinLobbyResult> {
    const res = await fetch(`${httpServerUrl}/lobby/join`, {
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

    if (res.status === 400 && json.detail === "Esta sala está llena!") {
        return { type: "LobbyFull", message: json.detail };
    }

    if (res.status === 400 && json.detail === "El jugador ya está en la partida") {
        return { type: "AlreadyJoined", message: json.detail };
    }

    if (res.status === 404 && json.detail === "No se pudo encontrar al jugador que realizó la solicitud") {
        return { type: "PlayerNotFound", message: json.detail };
    }

    if (res.status === 404 && json.detail === "No se pudo encontrar la sala deseada") {
        return { type: "LobbyNotFound", message: json.detail };
    }

    return { type: "Other", message: "Error al intentar crear partida" };
}

type LeaveLobbyResult = {
    type: "PlayerNotFound" | "LobbyNotFound" | "Ok" | "Other";
    message: string;
};

async function leaveLobby(playerId: string, lobbyId: string): Promise<LeaveLobbyResult> {
    const res = await fetch(`${httpServerUrl}/lobby/leave`, {
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

    if (res.status === 404 && json.detail === "No se pudo encontrar al jugador que realizó la solicitud") {
        return { type: "PlayerNotFound", message: json.detail };
    }

    if (res.status === 404 && json.detail === "No se pudo encontrar la sala deseada") {
        return { type: "LobbyNotFound", message: json.detail };
    }

    return { type: "Other", message: "Error al intentar abandonar partida" };
}

const lobbyService = {
    getJoinableLobbies,
    createLobby,
    joinLobby,
    leaveLobby,
};

export default lobbyService;
