import { useNavigate, useSearchParams } from "react-router-dom";
import LobbyLayout from "./components/LobbyLayout";
import { useEffect, useState } from "react";
import useLobbyWebsocket from "./hooks/LobbyWebsocket";

function Lobby() {
    const [ urlParams ] = useSearchParams();
    const navigate = useNavigate();

    const [ playerId, setPlayerId ] = useState<string>("");
    const players = useLobbyWebsocket(playerId);

    useEffect(() => {
        const playerUrlParam = urlParams.get("player");

        if (playerUrlParam === null) {
            navigate("/");
        } else {
            setPlayerId(playerUrlParam);
        }

    }, [navigate, urlParams]);


    return (
        <LobbyLayout
            playerId={playerId}
            players={players}
        />
    );
}

export default Lobby;
