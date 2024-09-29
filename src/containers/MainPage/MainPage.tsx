import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LobbyElement } from "./components/LobbyList";
import { createLobby, getJoinableLobbies } from "../../api/lobby";

export interface LobbyForm {
    name: string;
}

async function getLobbies(): Promise<LobbyElement[]> {
    try {
        return await getJoinableLobbies();
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
            const lobbyId = await createLobby(
                urlParams.get("player") ?? "",
                state.name,
                state.maxPlayers,
            );

            alert(`Lobby id: ${lobbyId}`);
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
