import { useEffect, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageInSchema } from "../../../domain/LobbyMessage";

type PlayerObject = {
    name: string;
    id: PlayerId;
}

function useLobbyWebsocket(playerId: string): PlayerObject[] {
    const [ players, setPlayers ] = useState<PlayerObject[]>([]);

    useEffect(() => {
        if (playerId === "")
            return;

        const socket = new WebSocket(`ws://127.0.0.1:8000/lobby/${playerId}`);

        socket.onmessage = (e: MessageEvent) => {
            const messageString = e.data as string;
            const message = LobbyMessageInSchema.parse(JSON.parse(messageString));

            switch (message.type) {
                case "player-list":
                    console.log(message.players);
                    setPlayers(message.players);
                    break;
                case "game-started":
                    break;
                case "ping":
                    console.log("ping");
                    break;
            }
        };

        return () => {
            socket.close();
        };

    }, [playerId]);

    return players;
}

export default useLobbyWebsocket;
