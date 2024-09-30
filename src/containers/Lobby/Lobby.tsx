import { useNavigate, useSearchParams } from "react-router-dom";
import LobbyLayout from "./components/LobbyLayout";
import { useEffect, useState } from "react";
import useLobbyWebsocket from "./hooks/LobbyWebsocket";
import { leaveLobby } from "../../api/lobby";

function Lobby() {
    const [ urlParams ] = useSearchParams();
    const navigate = useNavigate();

    const [ playerId, setPlayerId ] = useState<string>("");
    const { players, lobbyName, lobbyId, ownerId } = useLobbyWebsocket(playerId);

    useEffect(() => {
        const playerUrlParam = urlParams.get("player");

        if (playerUrlParam === null) {
            navigate("/");
        } else {
            setPlayerId(playerUrlParam);
        }

    }, [navigate, urlParams]);

    async function quitHandler() {
        try {
            const res = await leaveLobby(playerId, lobbyId);

            if (res === "Jugador no encontrado" || res === null) {
                navigate("/");
            }

            if (res === "Sala no encontrada" || res === "Ok") {
                navigate(`/lobby?player=${playerId}`);
            }
        } catch {
            navigate("/");
        }
    }

    return (
        <LobbyLayout
            playerId={playerId}
            players={players}
            lobbyName={lobbyName}
            isOwner={ownerId === playerId}
            quitHandler={() => void quitHandler()}
        />
    );
}

export default Lobby;
