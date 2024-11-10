import LobbyListPageLayout from "./LobbyListPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toInitial, toLobby } from "../../navigation/destinations";
import lobbyService, { LobbyElement } from "../../services/lobbyService";
import useUrlPlayerId from "../../hooks/useUrlPlayerId";


function LobbyListPage() {
    const navigate = useNavigate();
    const playerId = useUrlPlayerId();

    const [lobbies, setLobbies] = useState<LobbyElement[] | null>(null);

    const fetchLobbies = useCallback(async () => {
        if (playerId == null) {
            return;
        }

        try {
            const lobbies = await lobbyService.getLobbies(playerId);
            setLobbies(lobbies);
        } catch (error) {
            console.error(error);
        }
    }, [playerId]);

    useEffect(() => void fetchLobbies(), [fetchLobbies]);

    const handleSubmitLobby = useCallback(async (state: CreateLobbyFormState) => {
        if (playerId == null) {
            return;
        }

        try {
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

            if (res.type === "Ok") {
                navigate(toLobby(res.lobby_id!, playerId));
                return;
            }
        } catch {
            alert("Error al comunicarse con el servidor, intente de nuevo más tarde.");
        }
    }, [navigate, playerId]);

    const handleRefreshLobbies = useCallback(() => {
        setLobbies(null);
        void fetchLobbies();
    }, [fetchLobbies]);

    const handleJoinLobby = useCallback(async (lobbyId: string) => {
        if (playerId == null) {
            return;
        }

        const res = await lobbyService.joinLobby(playerId, lobbyId);

        if (res.type === "Ok" || res.type === "AlreadyJoined") {
            navigate(toLobby(lobbyId, playerId));
            return;
        }

        if (res.type === "PlayerNotFound") {
            navigate(toInitial());
            return;
        }

        alert(res.message);
    }, [navigate, playerId]);

    if (playerId == null) {
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
