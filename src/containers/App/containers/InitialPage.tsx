import { useNavigate } from "react-router-dom";
import PlayerNameForm from "../components/PlayerNameForm";

function InitialPage() {
    const navigate = useNavigate();

    async function createPlayer(playerName: string) {
        const res = await fetch("http://127.0.0.1:8000/player", {
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

        navigate(`play?user=${data.player_id}`);
    }

    return (
        <PlayerNameForm handleSubmit={name => void createPlayer(name)} />
    );
}

export default InitialPage;
