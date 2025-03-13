import { useNavigate } from "react-router-dom";
import PlayerNameForm from "./components/PlayerNameForm";
import { useState } from "react";
import { toLobbyList } from "../../navigation/destinations";
import playerService from "../../services/playerService";

function InitialPage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(playerName: string) {
        try {
            const playerId = await playerService.createPlayer(playerName);

            navigate(toLobbyList(playerId));
        } catch {
            setServerError("Hubo un error en el servidor. Por favor intente más tarde.");
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
        <div className="justify-self-center">
            <PlayerNameForm
                submitError={serverError}
                onSubmit={name => void handleSubmit(name)}
            />
        </div>
    </div>;
}

export default InitialPage;
