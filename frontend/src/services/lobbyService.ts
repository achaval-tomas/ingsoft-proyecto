import { httpServerUrl } from "./config";
import { get, post } from "./util";

export interface LobbyElement {
    lobby_id: string;
    lobby_name: string;
    player_amount: number;
    max_players: number;
    joined: boolean;
    isPasswordProtected: boolean;
}

async function getLobbies(playerId: string): Promise<LobbyElement[]> {
    const res = await get(`${httpServerUrl}/lobby?player_id=${playerId}`);

    const data = await res.json() as LobbyElement[];

    return data.filter(l => l.max_players > l.player_amount);
}

type CreateLobbyResult = {
    type: "PlayerNotFound" | "Ok" | "Other";
    message: string;
    lobby_id: string | null;
};

async function createLobby(
    playerId: string,
    lobbyName: string,
    maxPlayers: number,
    password: string,
): Promise<CreateLobbyResult> {
    const res = await post(`${httpServerUrl}/lobby`, {
        lobby_name: lobbyName,
        lobby_owner: playerId,
        min_players: 2,
        max_players: maxPlayers,
        password,
    });

    if (res.ok) {
        const data = await res.json() as { lobby_id: string };
        return { type: "Ok", message: "", lobby_id: data.lobby_id };
    }

    const json = await res.json() as { detail: string };

    if (res.status === 404 && json.detail === "No se pudo encontrar al jugador que realizó la solicitud") {
        return { type: "PlayerNotFound", message: json.detail, lobby_id: null };
    }

    return { type: "Other", message: "Error al intentar crear partida", lobby_id: null };
}

type JoinLobbyResult = {
    type: "PlayerNotFound" | "LobbyNotFound" | "LobbyFull" | "AlreadyJoined" | "Ok" | "Other" | "InvalidPassword";
    message: string;
};

async function joinLobby(playerId: string, lobbyId: string, password: string): Promise<JoinLobbyResult> {
    const res = await post(`${httpServerUrl}/lobby/join`, {
        player_id: playerId,
        lobby_id: lobbyId,
        password,
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

    if (res.status === 401 && json.detail === "Contraseña incorrecta") {
        return { type: "InvalidPassword", message: json.detail };
    }

    return { type: "Other", message: "Error al intentar unirse a la partida" };
}

type LeaveLobbyResult = {
    type: "PlayerNotFound" | "LobbyNotFound" | "Ok" | "Other";
    message: string;
};

async function leaveLobby(playerId: string, lobbyId: string): Promise<LeaveLobbyResult> {
    const res = await post(`${httpServerUrl}/lobby/leave`, {
        player_id: playerId,
        lobby_id: lobbyId,
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
    getLobbies,
    createLobby,
    joinLobby,
    leaveLobby,
};

export default lobbyService;
