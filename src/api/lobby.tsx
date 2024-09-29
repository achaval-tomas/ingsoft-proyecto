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

export { getJoinableLobbies, createLobby };
