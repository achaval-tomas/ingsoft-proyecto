import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export interface LobbyForm {
    name: string;
}

interface LobbyObject {
    min_players: number;
    max_players: number;
    lobby_owner: string;
    players: string;
    lobby_id: string;
    lobby_name: string;
    player_amount: number;
}

async function getLobbies(): Promise<LobbyObject[]> {
    const res = await fetch("http://127.0.0.1:8000/lobby", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

    const data = await res.json() as LobbyObject[];

    return data;
}

function MainPage() {
    const [ urlParams ] = useSearchParams();

    useEffect(() => {
        void getLobbies();
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
            />
            :
            <Navigate to="/" replace />
    );
}

export default MainPage;
