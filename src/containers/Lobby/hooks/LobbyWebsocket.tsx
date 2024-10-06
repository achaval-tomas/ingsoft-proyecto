import { useEffect, useRef, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageInSchema } from "../../../domain/LobbyMessage";
import { useNavigate } from "react-router-dom";
import { toHome, toPlay } from "../../../navigation/destinations";

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
    const wsRef = useRef<WebSocket | null>(null);
    const [wsGeneration, setWsGeneration] = useState(0);

    const [players, setPlayers] = useState<PlayerObject[]>([]);
    const [lobbyId, setLobbyId] = useState<string>("");
    const [lobbyName, setLobbyName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<PlayerId>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (playerId === "") {
            return;
        }

        const ws = new WebSocket(`ws://127.0.0.1:8000/lobby/${playerId}`);

        wsRef.current = ws;

        ws.onmessage = (e: MessageEvent) => {
            const messageString = e.data as string;
            try {
                const message = LobbyMessageInSchema.parse(JSON.parse(messageString));
                switch (message.type) {
                    case "player-list":
                        setPlayers(message.players);
                        break;
                    case "game-started":
                        navigate(toPlay(playerId));
                        break;
                    case "lobby-state":
                        if (message.players.find(p => p.id === playerId) === undefined) {
                            navigate(toHome(playerId));
                        }
                        setLobbyId(message.id);
                        setPlayers(message.players);
                        setOwnerId(message.owner);
                        setLobbyName(message.name);
                        break;
                    case "destroy-lobby":
                        navigate(toHome(playerId));
                        break;
                }
            } catch {
                navigate(toHome(playerId));
            }

        };

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "get-lobby-state" }));
        };

        ws.onclose = () => {
            setTimeout(() => {
                setWsGeneration(g => wsRef.current === ws ? g + 1 : g);
            }, 5000);
        };

        return () => {
            ws.close();
        };

    }, [playerId, navigate, wsGeneration]);

    return { players, lobbyId, lobbyName, ownerId };
}

export default useLobbyWebsocket;
