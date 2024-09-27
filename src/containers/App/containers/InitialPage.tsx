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

    return <div className="flex flex-col align-center w-screen px-16">
        <h1 className="my-16 text-center">El Switcher</h1>
        <PlayerNameForm handleSubmit={name => void createPlayer(name)} />
    </div>;
}

export default InitialPage;
