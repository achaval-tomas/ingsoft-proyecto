import { useEffect, useRef } from "react";
import { PlayerId } from "../../../domain/GameState";
import { wsServerUrl } from "../../../services/config";
import { GameMessageIn, GameMessageInSchema, GameMessageOut } from "../../../domain/GameMessage";

function useGameWebSocket(
    playerId: PlayerId,
    onReceive: (msg: GameMessageIn) => void,
): (msg: GameMessageOut) => void {
    const wsRef = useRef<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${wsServerUrl}/game/${playerId}`);
        wsRef.current = ws;

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

        return () => ws.close();
    }, [playerId, onReceive]);

    return (msg) => {
        try {
            wsRef.current?.send(JSON.stringify(msg));
        } catch (error) {
            console.error("error when sending game message");
            console.error(error);
            // TODO: recreate ws
        }
    };
}

export default useGameWebSocket;