import LobbyListPageLayout from "./LobbyListPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toInitial, toLobby } from "../../navigation/destinations";
import lobbyService, { LobbyElement } from "../../services/lobbyService";


function LobbyListPage() {
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    const [lobbies, setLobbies] = useState<LobbyElement[] | null>(null);

    async function fetchLobbies() {
        try {
            const lobbies = await lobbyService.getJoinableLobbies();
            setLobbies(lobbies);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        void fetchLobbies();
    }, []);

    async function handleSubmitLobby(state: CreateLobbyFormState) {
        try {
            const playerId = urlParams.get("player") ?? "";

            const res = await lobbyService.createLobby(
                playerId,
                state.name,
                state.maxPlayers,
            );

            if (res.type === "PlayerNotFound" || res.type === "Other") {
                alert(res.message);
                navigate(toInitial());
                return;
            }

            if (res.type === "AlreadyJoinedOtherLobby") {
                alert(res.message);
                navigate(toLobby(playerId));
                return;
            }

            if (res.type === "Ok") {
                navigate(toLobby(playerId));
                return;
            }
        } catch {
            alert("Error al comunicarse con el servidor, intente de nuevo más tarde.");
        }
    }

    function handleRefreshLobbies() {
        setLobbies(null);
        void fetchLobbies();
    }

    async function handleJoinLobby(lobbyId: string) {
        const playerId = urlParams.get("player") ?? "";
        const res = await lobbyService.joinLobby(playerId, lobbyId);

        if (res.type === "Ok") {
            navigate(toLobby(playerId));
            return;
        }

        if (res.type === "AlreadyJoined" || res.type === "AlreadyJoinedOtherLobby") {
            alert(res.message);
            navigate(toLobby(playerId));
            return;
        }

        if (res.type === "PlayerNotFound") {
            navigate(toInitial());
            return;
        }

        alert(res.message);
    }

    if (urlParams.get("player") == null) {
        return <Navigate to={toInitial()} replace />;
    }

    return (
        <LobbyListPageLayout
            onSubmitLobbyForm={s => void handleSubmitLobby(s)}
            lobbies={lobbies}
            onRefresh={handleRefreshLobbies}
            onJoinLobby={lobbyId => void handleJoinLobby(lobbyId)}
        />
    );
}

export default LobbyListPage;
