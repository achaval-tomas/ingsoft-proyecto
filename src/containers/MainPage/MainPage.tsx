import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LobbyElement } from "./components/LobbyList";
import { toInitial, toLobby } from "../../navigation/destinations";
import lobbyService from "../../services/lobbyService";

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

function MainPage() {
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [lobbies, setLobbies] = useState<LobbyElement[]>([]);

    async function fetchAndSaveLobbies() {
        setLobbies(await getLobbies());
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

    const filteredLobbies = useMemo(
        () => lobbies.filter(l => l.lobby_name.toLowerCase().includes(searchQuery.toLowerCase())),
        [lobbies, searchQuery],
    );

    async function handleSubmit(state: CreateLobbyFormState) {
        try {
            const playerId = urlParams.get("player") ?? "";

            const lobbyId = await lobbyService.createLobby(
                playerId,
                state.name,
                state.maxPlayers,
            );

            if (lobbyId === null) {
                alert("Jugador no existente");
                navigate(toInitial());
                return;
            }

            navigate(toLobby(playerId));
        } catch {
            alert("Error al comunicarse con el servidor, intente de nuevo más tarde.");
        }
    }

    async function joinHandler(lobbyId: string) {
        const playerId = urlParams.get("player") ?? "";
        const res = await lobbyService.joinLobby(playerId, lobbyId);

        if (res.type === "Ok" || res.type === "AlreadyJoined") {
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
        <MainPageLayout
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSubmitLobbyForm={s => void handleSubmit(s)}
            lobbies={filteredLobbies}
            refreshHandler={() => {
                void fetchAndSaveLobbies();
            }}
            joinHandler={lobbyId => void joinHandler(lobbyId)}
        />
    );
}

export default MainPage;
