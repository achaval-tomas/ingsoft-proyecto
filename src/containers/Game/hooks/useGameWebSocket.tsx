import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { wsServerUrl } from "../../../services/config";
import { GameMessageIn, GameMessageInSchema, GameMessageOut } from "../../../domain/GameMessage";

function createWebSocket(
    playerId: PlayerId,
    onOpen: (ws: WebSocket) => void,
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

        console.log("rx: ", message);
        onReceive(message);
    });

    ws.addEventListener("open", () => {
        onOpen(ws);
    });

    ws.addEventListener("close", () => {
        // TODO: onClose for reconnecting automatically
    });

    return ws;
}

function tryFlushQueue(ws: WebSocket, messageQueue: GameMessageOut[]) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }

    while (messageQueue.length !== 0) {
        if (ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const message = messageQueue[0];
        const messageString = JSON.stringify(message);

        console.log("tx: ", message);

        try {
            ws.send(messageString);
        } catch (error) {
            console.error("error sending ws message");
            console.error(error);
            return;
        }

        messageQueue.shift();
    }
}


function useGameWebSocket(
    playerId: PlayerId,
    onReceive: (msg: GameMessageIn) => void,
): (msg: GameMessageOut) => void {
    const messageQueueRef = useRef<GameMessageOut[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    // Used for triggering recreation of the websocket
    const [wsGeneration, setWsGeneration] = useState(0);

    useEffect(() => {
        const ws = createWebSocket(playerId, (ws) => tryFlushQueue(ws, messageQueueRef.current), onReceive);
        wsRef.current = ws;
        return () => ws.close();
    }, [playerId, onReceive, wsGeneration]);

    const sendMessage = useCallback((msg: GameMessageOut) => {
        const ws = wsRef.current;
        const messageQueue = messageQueueRef.current;

        messageQueue.push(msg);

        if (ws == null) {
            return;
        }

        tryFlushQueue(ws, messageQueue);

        if (messageQueue.length !== 0 && ws.readyState !== WebSocket.CONNECTING) {
            setWsGeneration(g => g + 1);
        }
    }, []);

    return sendMessage;
}

export default useGameWebSocket;