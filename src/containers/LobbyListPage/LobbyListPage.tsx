import LobbyListPageLayout from "./LobbyListPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toInitial, toLobby } from "../../navigation/destinations";
import lobbyService, { LobbyElement } from "../../services/lobbyService";


export interface LobbyForm {
    name: string;
}

async function getLobbies(): Promise<LobbyElement[]> {
    try {
        return await lobbyService.getJoinableLobbies();
    } catch {
        return [];
    }
}

function LobbyListPage() {
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    const [lobbies, setLobbies] = useState<LobbyElement[] | null>(null);

    async function fetchAndSaveLobbies() {
        setLobbies(await getLobbies());
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

    async function handleSubmit(state: CreateLobbyFormState) {
        try {
            const playerId = urlParams.get("player") ?? "";

            const res = await lobbyService.createLobby(
                playerId,
                state.name,
                state.maxPlayers,
            );

            if (res.type === "PlayerNotFound" || res.type === "Other") {
                alert(res.message);
                navigate(toInitial());
                return;
            }

            if (res.type === "AlreadyJoinedOtherLobby") {
                alert(res.message);
                navigate(toLobby(playerId));
                return;
            }

            if (res.type === "Ok") {
                navigate(toLobby(playerId));
                return;
            }
        } catch {
            alert("Error al comunicarse con el servidor, intente de nuevo más tarde.");
        }
    }

    async function joinHandler(lobbyId: string) {
        const playerId = urlParams.get("player") ?? "";
        const res = await lobbyService.joinLobby(playerId, lobbyId);

        if (res.type === "Ok") {
            navigate(toLobby(playerId));
            return;
        }

        if (res.type === "AlreadyJoined" || res.type === "AlreadyJoinedOtherLobby") {
            alert(res.message);
            navigate(toLobby(playerId));
            return;
        }

        if (res.type === "PlayerNotFound") {
            navigate(toInitial());
            return;
        }

        alert(res.message);
    }

    if (urlParams.get("player") == null) {
        return <Navigate to={toInitial()} replace />;
    }

    return (
        <LobbyListPageLayout
            onSubmitLobbyForm={s => void handleSubmit(s)}
            lobbies={lobbies}
            refreshHandler={() => {
                setLobbies(null);
                void fetchAndSaveLobbies();
            }}
            joinHandler={lobbyId => void joinHandler(lobbyId)}
        />
    );
}

export default LobbyListPage;
