import MainPageLayout from "./components/MainPageLayout";
import { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
    const [allLobbies, setallLobbies] = useState<LobbyElement[]>([]);
    const [filteredLobbies, setFilteredLobbies] = useState<LobbyElement[]>([])
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    async function fetchAndSaveLobbies() {
        setallLobbies(await getLobbies());
        setFilteredLobbies(await getLobbies())
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

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

    function handleSearch(searchQuery: number | "") {
        if (searchQuery === "") {
            fetchAndSaveLobbies();
        } else {
            const filtered = allLobbies.filter((lobby) => lobby.player_amount == searchQuery)
            setFilteredLobbies(filtered)
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
            onSubmitLobbyForm={s => void handleSubmit(s)}
            lobbies={filteredLobbies}
            refreshHandler={() => {
                void fetchAndSaveLobbies();
            }}
            joinHandler={lobbyId => void joinHandler(lobbyId)}
            handleSearch={handleSearch}
        />
    );
}

export default MainPage;
