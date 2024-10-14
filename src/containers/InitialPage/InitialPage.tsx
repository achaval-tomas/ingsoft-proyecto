import { useNavigate } from "react-router-dom";
import PlayerNameForm from "./components/PlayerNameForm";
import { useState } from "react";
import { toHome } from "../../navigation/destinations";
import playerService from "../../services/playerService";

function InitialPage() {
    const [serverError, setServerError] = useState<boolean>(false);
    const navigate = useNavigate();

    async function handleSubmit(playerName: string) {
        try {
            const playerId = await playerService.createPlayer(playerName);

            navigate(toHome(playerId));
        } catch {
            setServerError(true);
        }
    }

    return <div className="w-screen h-screen grid items-center gap-4" style={{ gridTemplateRows: "1fr 1fr 1fr" }}>
        <div className="w-full drop-shadow-[0_0_8px_#f6931e]">
            <div className="w-full bg-[#f6931e] py-1">
                <div className="w-full bg-black py-1">
                    <div className="w-full bg-[#f6931e] py-1">
                        <div className="w-full bg-black py-1">
                            <h1 className="w-full text-center bg-[#f6931e] p-4 text-black text-[5rem]" style={{ fontFamily: "seaside-resort" }}>El Switcher</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="w-full flex-grow flex justify-center items-center">
            <PlayerNameForm onSubmit={name => void handleSubmit(name)} />
            { serverError &&
                <p className="text-center text-red-500 py-2">
                    Hay un error en el servidor, por favor intentá más tarde
                </p>
            }
        </div>
    </div>;
}

export default InitialPage;
