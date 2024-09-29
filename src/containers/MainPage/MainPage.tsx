import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LobbyElement } from "./components/LobbyList";

export interface LobbyForm {
    name: string;
}

async function getLobbies(): Promise<LobbyElement[]> {
    try {
        const res = await fetch("http://127.0.0.1:8000/lobby", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });

        const data = await res.json() as LobbyElement[];

        return data.filter(l => l.max_players > l.player_amount);
    } catch {
        return [];
    }
}

function MainPage() {
    const [ lobbies, setLobbies ] = useState<LobbyElement[]>([]);
    const [ urlParams ] = useSearchParams();

    async function fetchAndSaveLobbies() {
        setLobbies(await getLobbies());
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

    async function handleSubmit(state: CreateLobbyFormState) {

        try {
            const res = await fetch("http://127.0.0.1:8000/lobby", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lobby_name: state.name,
                    lobby_owner: urlParams.get("player"),
                    min_players: 2,
                    max_players: state.maxPlayers,
                }),
            });

            const data = await res.json() as { lobby_id: string };

            alert(`Lobby id: ${data.lobby_id}`);
        } catch {
            alert("Error when communicating with server, try again later.");
        }
    }

    return (
        urlParams.get("player") ?
            <MainPageLayout
                onSubmitLobbyForm = {s => void handleSubmit(s)}
                lobbies={lobbies}
                refreshHandler={() => { void fetchAndSaveLobbies(); }}
            />
            :
            <Navigate to="/" replace />
    );
}

export default MainPage;
