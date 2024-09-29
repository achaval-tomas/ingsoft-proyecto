import { LobbyElement } from "../containers/MainPage/components/LobbyList";

async function getJoinableLobbies(): Promise<LobbyElement[]> {
    const res = await fetch("http://127.0.0.1:8000/lobby", {
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
    const res = await fetch("http://127.0.0.1:8000/lobby", {
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

type joinLobbyResponse = {
    goHome: boolean;
    errorMsg: string;
}

async function joinLobby(playerId: string, lobbyId: string): Promise<joinLobbyResponse> {
    const res = await fetch("http://127.0.0.1:8000/lobby/join", {
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
        return { goHome: false, errorMsg: "" };

    const json = await res.json() as { detail: string };

    if (res.status === 400 && json.detail === "Lobby is full") {
        return { goHome: false, errorMsg: "Esta sala está llena." };
    }

    if (res.status === 400 && json.detail === "Already joined") {
        return { goHome: false, errorMsg: "El jugador ya está en esta sala." };
    }

    if (res.status === 404 && json.detail === "Player not found") {
        return { goHome: true, errorMsg: "El jugador no existe." };
    }

    if (res.status === 404 && json.detail === "Lobby not found") {
        return { goHome: false, errorMsg: "Esta sala no existe." };
    }

    return { goHome: false, errorMsg: "Error en el servidor." };
}

export { getJoinableLobbies, createLobby, joinLobby };
