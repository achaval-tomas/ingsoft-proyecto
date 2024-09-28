import { useNavigate } from "react-router-dom";
import PlayerNameForm from "./components/PlayerNameForm";
import { useState } from "react";

function InitialPage() {
    const [ serverError, setServerError ] = useState<boolean>(false);
    const navigate = useNavigate();

    async function createPlayer(playerName: string) {
        try {
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

            navigate(`lobby?player=${data.player_id}`);
        } catch {
            setServerError(true);
        }
    }

    return <div className="flex flex-col align-center w-screen px-16">
        <h1 className="my-16 text-center">El Switcher</h1>
        <PlayerNameForm handleSubmit={name => void createPlayer(name)} />
        { serverError &&
            <p
                className="text-center text-red-500 py-2"
            >
                Hay un error en el servidor, por favor intentá más tarde
            </p>
        }
    </div>;
}

export default InitialPage;
