import { Navigate, useNavigate, useParams } from "react-router-dom";
import LobbyLayout from "./components/LobbyLayout";
import useLobbyWebsocket from "./hooks/LobbyWebsocket";
import { toLobbyList, toInitial, toPlay } from "../../navigation/destinations";
import lobbyService from "../../services/lobbyService";
import gameService from "../../services/gameService";
import useUrlPlayerId from "../../hooks/useUrlPlayerId";

function Lobby() {
    const lobbyId = useParams<{ lobbyId: string }>().lobbyId ?? null;
    const playerId = useUrlPlayerId();
    const navigate = useNavigate();

    const { players, lobbyName, ownerId } = useLobbyWebsocket(lobbyId, playerId);

    async function quitHandler() {
        if (lobbyId == null || playerId == null) {
            return;
        }

        try {
            const res = await lobbyService.leaveLobby(playerId, lobbyId);

            if (res.type === "PlayerNotFound" || res.type === "Other") {
                alert(res.message);
                navigate(toInitial());
                return;
            }

            if (res.type === "LobbyNotFound" || res.type === "Ok") {
                navigate(toLobbyList(playerId));
                return;
            }
        } catch {
            navigate(toInitial());
        }
    }

    async function startHandler() {
        if (lobbyId == null || playerId == null) {
            return;
        }

        try {
            const res = await gameService.createGame(playerId, lobbyId);

            if (res.type === "PlayerNotFound" || res.type === "Other") {
                alert(res.message);
                navigate(toInitial());
            }

            if (res.type === "NotEnoughPlayers" || res.type === "NotOwner") {
                alert(res.message);
            }

            if (res.type === "LobbyNotFound") {
                navigate(toLobbyList(playerId));
            }

            if (res.type === "Ok") {
                navigate(toPlay(lobbyId, playerId));
            }
        } catch {
            navigate(toInitial());
        }
    }

    if (playerId == null) {
        return <Navigate to={toInitial()} replace />;
    }

    if (lobbyId == null) {
        return <Navigate to={toLobbyList(playerId)} replace />;
    }

    return (
        <LobbyLayout
            playerId={playerId}
            players={players}
            lobbyName={lobbyName}
            canStart={ownerId === playerId && players.length > 1}
            quitHandler={() => void quitHandler()}
            startHandler={() => void startHandler()}
            isOwner={ownerId === playerId}
        />
    );
}

export default Lobby;
