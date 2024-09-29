import { useNavigate } from "react-router-dom";
import PlayerNameForm from "./components/PlayerNameForm";
import { useState } from "react";
import { createPlayer } from "../../api/player";

function InitialPage() {
    const [ serverError, setServerError ] = useState<boolean>(false);
    const navigate = useNavigate();

    async function createPlayerHandler(playerName: string) {
        try {
            const playerId = await createPlayer(playerName);

            navigate(`lobby?player=${playerId}`);
        } catch {
            setServerError(true);
        }
    }

    return <div className="flex flex-col align-center w-screen px-16">
        <h1 className="my-16 text-center">El Switcher</h1>
        <PlayerNameForm handleSubmit={name => void createPlayerHandler(name)} />
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
