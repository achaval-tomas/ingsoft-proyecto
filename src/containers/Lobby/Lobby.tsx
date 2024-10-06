import { useNavigate, useSearchParams } from "react-router-dom";
import LobbyLayout from "./components/LobbyLayout";
import { useEffect, useState } from "react";
import useLobbyWebsocket from "./hooks/LobbyWebsocket";
import { leaveLobby } from "../../api/lobby";
import { toHome, toInitial, toPlay } from "../../navigation/destinations";
import gameService from "../../services/gameService";

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

            if (res.type === "PlayerNotFound" || res.type === "Other") {
                alert(res.message);
                navigate(toInitial());
                return;
            }

            if (res.type === "LobbyNotFound" || res.type === "Ok") {
                navigate(toHome(playerId));
                return;
            }
        } catch {
            navigate(toInitial());
        }
    }

    async function startHandler() {
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
                navigate(toHome(playerId));
            }

            if (res.type === "Ok") {
                navigate(toPlay(playerId));
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
