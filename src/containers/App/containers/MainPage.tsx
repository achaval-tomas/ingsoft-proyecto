import MainPageLayout from "../components/MainPageLayout";
import { CreateLobbyFormState } from "../components/CreateLobbyDialog";
import { Navigate, useSearchParams } from "react-router-dom";
export interface LobbyForm {
    name: string;
}

function MainPage() {
    const [ urlParams ] = useSearchParams();

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
