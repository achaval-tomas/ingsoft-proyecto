import { useEffect, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageInSchema } from "../../../domain/LobbyMessage";
import { useNavigate } from "react-router-dom";

type PlayerObject = {
    name: string;
    id: PlayerId;
}

type LobbyWebsocketFields = {
    players: PlayerObject[];
    lobbyId: string;
    lobbyName: string;
    ownerId: PlayerId;
}

function useLobbyWebsocket(playerId: string): LobbyWebsocketFields {
    const [ players, setPlayers ] = useState<PlayerObject[]>([]);
    const [ lobbyId, setLobbyId ] = useState<string>("");
    const [ lobbyName, setLobbyName ] = useState<string>("");
    const [ ownerId, setOwnerId ] = useState<PlayerId>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (playerId === "")
            return;

        const socket = new WebSocket(`ws://127.0.0.1:8000/lobby/${playerId}`);

        socket.onmessage = (e: MessageEvent) => {
            const messageString = e.data as string;
            console.log(messageString);
            try {
                const message = LobbyMessageInSchema.parse(JSON.parse(messageString));
                switch (message.type) {
                    case "player-list":
                        console.log(message.players);
                        setPlayers(message.players);
                        break;
                    case "game-started":
                        navigate(`/play?user=${playerId}`);
                        break;
                    case "lobby-state":
                        console.log(message);
                        if (message.players.find(p => p.id === playerId) === undefined) {
                            navigate(`/home?player=${playerId}`);
                        }
                        setLobbyId(message.id);
                        setPlayers(message.players);
                        setOwnerId(message.owner);
                        setLobbyName(message.name);
                        break;
                    case "destroy-lobby":
                        navigate(`/home?player=${playerId}`);
                        break;
                }
            } catch {
                navigate(`/home?player=${playerId}`);
            }

        };

        socket.onopen = () => {
            socket.send("get-lobby-state");
        };

        return () => {
            socket.close();
        };

    }, [playerId, navigate]);

    return { players, lobbyId, lobbyName, ownerId };
}

export default useLobbyWebsocket;
