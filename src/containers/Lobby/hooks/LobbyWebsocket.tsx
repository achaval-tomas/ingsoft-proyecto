import { useEffect, useRef, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageInSchema } from "../../../domain/LobbyMessage";
import { useNavigate } from "react-router-dom";
import { toLobbyList, toPlay } from "../../../navigation/destinations";
import { wsServerUrl } from "../../../services/config";

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

        const ws = new WebSocket(`${wsServerUrl}/lobby/${playerId}`);

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
                            navigate(toLobbyList(playerId));
                        }
                        setLobbyId(message.id);
                        setPlayers(message.players);
                        setOwnerId(message.owner);
                        setLobbyName(message.name);
                        break;
                    case "destroy-lobby":
                        navigate(toLobbyList(playerId));
                        break;
                }
            } catch {
                navigate(toLobbyList(playerId));
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
