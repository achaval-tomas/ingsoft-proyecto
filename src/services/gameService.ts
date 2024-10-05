import { PlayerId } from "../domain/GameState";
import { httpServerUrl } from "./config";

async function leaveGame(playerId: PlayerId) {
    return fetch(`${httpServerUrl}/game/leave`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
    });
}

const gameService = {
    leaveGame,
};

export default gameService;