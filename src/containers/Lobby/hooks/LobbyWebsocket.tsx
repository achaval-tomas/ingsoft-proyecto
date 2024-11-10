import { useEffect, useRef, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageIn, LobbyMessageInSchema } from "../../../domain/LobbyMessage";
import { useNavigate } from "react-router-dom";
import { toLobbyList, toPlay } from "../../../navigation/destinations";
import { wsServerUrl } from "../../../services/config";

type PlayerObject = {
    name: string;
    id: PlayerId;
}

type LobbyWebsocketFields = {
    players: PlayerObject[];
    lobbyName: string;
    ownerId: PlayerId;
}

function useLobbyWebsocket(lobbyId: string | null, playerId: string | null): LobbyWebsocketFields {
    const wsRef = useRef<WebSocket | null>(null);
    const [wsGeneration, setWsGeneration] = useState(0);

    const [players, setPlayers] = useState<PlayerObject[]>([]);
    const [lobbyName, setLobbyName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<PlayerId>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (lobbyId == null || playerId == null) {
            return;
        }

        const ws = new WebSocket(`${wsServerUrl}/lobby/${lobbyId}?player_id=${playerId}`);

        wsRef.current = ws;

        ws.onmessage = (e: MessageEvent) => {
            const messageString = e.data as string;

            let message: LobbyMessageIn;
            try {
                const messageJson: unknown = JSON.parse(messageString);
                console.log("rx: ", messageJson);
                message = LobbyMessageInSchema.parse(messageJson);
            } catch (err) {
                console.error(err);
                navigate(toLobbyList(playerId));
                return;
            }

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
                    setPlayers(message.players);
                    setOwnerId(message.owner);
                    setLobbyName(message.name);
                    break;
                case "destroy-lobby":
                    navigate(toLobbyList(playerId));
                    break;
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

    }, [lobbyId, playerId, navigate, wsGeneration]);

    return { players, lobbyName, ownerId };
}

export default useLobbyWebsocket;
