import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { wsServerUrl } from "../../../services/config";
import { GameMessageIn, GameMessageInSchema, GameMessageOut } from "../../../domain/GameMessage";

function createWebSocket(
    playerId: PlayerId,
    onReceive: (msg: GameMessageIn) => void,
): WebSocket {
    const ws = new WebSocket(`${wsServerUrl}/game/${playerId}`);

    ws.addEventListener("message", e => {
        if (typeof e.data !== "string") {
            console.error("invalid message type");
            console.error(e.data);
            return;
        }

        let message: GameMessageIn;
        try {
            message = GameMessageInSchema.parse(JSON.parse(e.data));
        } catch {
            console.error("invalid message object");
            console.error(e.data);
            return;
        }

        console.log(message);
        onReceive(message);
    });

    return ws;
}

function useGameWebSocket(
    playerId: PlayerId,
    onReceive: (msg: GameMessageIn) => void,
): (msg: GameMessageOut) => void {
    const [wsGeneration, setWsGeneration] = useState(0); // Used for triggering recreation of the websocket
    const wsRef = useRef<WebSocket>();

    useEffect(() => {
        const ws = createWebSocket(playerId, onReceive);
        wsRef.current = ws;
        return () => ws.close();
    }, [playerId, onReceive, wsGeneration]);

    const sendMessage = useCallback((msg: GameMessageOut) => {
        try {
            wsRef.current?.send(JSON.stringify(msg));
        } catch (error) {
            console.error("error when sending game message");
            console.error(error);
            setWsGeneration(g => g + 1);
        }
    }, []);

    return sendMessage;
}

export default useGameWebSocket;