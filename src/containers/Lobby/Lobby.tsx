import { useNavigate, useSearchParams } from "react-router-dom";
import LobbyLayout from "./components/LobbyLayout";
import { useEffect, useState } from "react";
import useLobbyWebsocket from "./hooks/LobbyWebsocket";
import { leaveLobby } from "../../api/lobby";
import { createGame } from "../../api/game";
import { toHome, toInitial } from "../../navigation/destinations";

function Lobby() {
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    const [playerId, setPlayerId] = useState<string>("");
    const { players, lobbyName, lobbyId, ownerId } = useLobbyWebsocket(playerId);

    useEffect(() => {
        const playerUrlParam = urlParams.get("player");

        if (playerUrlParam === null) {
            navigate(toInitial());
        } else {
            setPlayerId(playerUrlParam);
        }

    }, [navigate, urlParams]);

    async function quitHandler() {
        try {
            const res = await leaveLobby(playerId, lobbyId);

            if (res === "Jugador no encontrado" || res === null) {
                navigate(toInitial());
            }

            if (res === "Sala no encontrada" || res === "Ok") {
                navigate(toHome(playerId));
            }
        } catch {
            navigate(toInitial());
        }
    }

    async function startHandler() {
        try {
            const res = await createGame(playerId, lobbyId);

            if (res === "Jugador no encontrado" || res === null) {
                navigate(toInitial());
            }

            if (res === "No se completó el mínimo de jugadores" || res === "Solo el dueño de la sala puede iniciarlo") {
                alert(res);
            }

            if (res === "Sala no encontrada") {
                navigate(toHome(playerId));
            }

            if (res === "Ok") {
                navigate(`/play?player=${playerId}`);
            }
        } catch {
            navigate(toInitial());
        }
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
