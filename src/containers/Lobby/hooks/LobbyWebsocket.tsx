import { useEffect, useState } from "react";
import { PlayerId } from "../../../domain/GameState";
import { LobbyMessageInSchema } from "../../../domain/LobbyMessage";

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

    useEffect(() => {
        if (playerId === "")
            return;

        const socket = new WebSocket(`ws://127.0.0.1:8000/lobby/${playerId}`);

        socket.onmessage = (e: MessageEvent) => {
            const messageString = e.data as string;
            console.log(messageString);
            const message = LobbyMessageInSchema.parse(JSON.parse(messageString));

            switch (message.type) {
                case "player-list":
                    console.log(message.players);
                    setPlayers(message.players);
                    break;
                case "game-started":
                    break;
                case "lobby-state":
                    console.log(message);
                    setLobbyId(message.id);
                    setPlayers(message.players);
                    setOwnerId(message.owner);
                    setLobbyName(message.name);
                    break;
            }
        };

        socket.onopen = () => {
            socket.send("get-lobby-state");
        };

        return () => {
            socket.close();
        };

    }, [playerId]);

    return { players, lobbyId, lobbyName, ownerId };
}

export default useLobbyWebsocket;
