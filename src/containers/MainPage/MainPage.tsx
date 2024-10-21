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
    const [lobbies, setLobbies] = useState<LobbyElement[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [minPlayerCountQuery, setMinPlayerCountQuery] = useState<number>(0);
    const [maxPlayerCountQuery, setMaxPlayerCountQuery] = useState<number>(3);

    async function fetchAndSaveLobbies() {
        setLobbies(await getLobbies());
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

    function handleResetQuerys() {
        setSearchQuery("");
        setMinPlayerCountQuery(0);
        setMaxPlayerCountQuery(3);
    }

    const filteredLobbies = useMemo(() => {
        return lobbies
            .filter(l => l.lobby_name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(l => minPlayerCountQuery <= l.player_amount && l.player_amount <= maxPlayerCountQuery);
    }, [lobbies, searchQuery, minPlayerCountQuery, maxPlayerCountQuery]);

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
        <MainPageLayout
            searchQuery={searchQuery}
            minPlayerCountQuery={minPlayerCountQuery}
            maxPlayerCountQuery={maxPlayerCountQuery}
            onSearchQueryChange={setSearchQuery}
            onMinPlayerCountQueryChange={setMinPlayerCountQuery}
            onMaxPlayerCountQueryChange={setMaxPlayerCountQuery}
            onResetQuerys={handleResetQuerys}
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
