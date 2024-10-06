import { httpServerUrl } from "./config";

async function createPlayer(playerName: string): Promise<string> {
    const res = await fetch(`${httpServerUrl}/player`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            player_name: playerName,
        }),
    });

    const data = await res.json() as { player_id: string };

    return data.player_id;
}

const playerService = {
    createPlayer,
};

export default playerService;
