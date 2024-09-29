import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LobbyElement } from "./components/LobbyList";
import { createLobby, getJoinableLobbies, joinLobby } from "../../api/lobby";

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
            alert("Error al comunicarse con el servidor, intente de nuevo más tarde.");
        }
    }

    async function joinHandler(lobbyId: string) {
        const res = await joinLobby(urlParams.get("player") ?? "", lobbyId);

        if (res.errorMsg !== "")
            alert(res.errorMsg);
    }

    return (
        urlParams.get("player") ?
            <MainPageLayout
                onSubmitLobbyForm = {s => void handleSubmit(s)}
                lobbies={lobbies}
                refreshHandler={() => { void fetchAndSaveLobbies(); }}
                joinHandler={ lobbyId => void joinHandler(lobbyId) }
            />
            :
            <Navigate to="/" replace />
    );
}

export default MainPage;
