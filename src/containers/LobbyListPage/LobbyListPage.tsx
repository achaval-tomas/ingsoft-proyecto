import LobbyListPageLayout from "./LobbyListPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toInitial, toLobby, toPlay } from "../../navigation/destinations";
import lobbyService, { LobbyElement } from "../../services/lobbyService";
import useUrlPlayerId from "../../hooks/useUrlPlayerId";
import gameService, { JoinedGame } from "../../services/gameService";
import { useDispatch } from "react-redux";
import { createErrorNotification } from "../../reducers/Action";


function LobbyListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const playerId = useUrlPlayerId();

    const [lobbies, setLobbies] = useState<LobbyElement[] | null>(null);
    const [joinedGames, setJoinedGames] = useState<JoinedGame[] | null>(null);

    const fetchLobbies = useCallback(async () => {
        if (playerId == null) {
            return;
        }

        setLobbies(null);

        try {
            const lobbies = await lobbyService.getLobbies(playerId);
            setLobbies(lobbies);
        } catch (error) {
            console.error(error);
            dispatch(createErrorNotification("Ocurrió un error al obtener la lista de salas."));
        }
    }, [dispatch, playerId]);

    const fetchJoinedGames = useCallback(async () => {
        if (playerId == null) {
            return;
        }

        setJoinedGames(null);

        try {
            setJoinedGames(await gameService.getJoinedGames(playerId));
        } catch (error) {
            console.error(error);
            dispatch(createErrorNotification("Ocurrió un error al obtener la lista de partidas."));
        }
    }, [dispatch, playerId]);

    const fetchAll = useCallback(() => {
        void fetchLobbies();
        void fetchJoinedGames();
    }, [fetchLobbies, fetchJoinedGames]);

    useEffect(() => void fetchAll(), [fetchAll]);

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

    const handleRefreshLobbies = useCallback(() => void fetchAll(), [fetchAll]);

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
            joinedGames={joinedGames}
            lobbies={lobbies}
            onRefresh={handleRefreshLobbies}
            onJoinGame={gameId => navigate(toPlay(gameId, playerId))}
            onJoinLobby={lobbyId => void handleJoinLobby(lobbyId)}
        />
    );
}

export default LobbyListPage;
