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
    const [searchByNameQuery, setSearchByNameQuery] = useState<string>("")
    const [searchByPlayerCQuery, setSearchByPlayerCQuery] = useState<number>(0)
    const [searchByNameState, setSearchByNameState] = useState(false)
    const [searchByPlayerCState, setSearchByPlayerCState] = useState(false)

    async function fetchAndSaveLobbies() {
        setLobbies(await getLobbies());
    }

    useEffect(() => {
        void fetchAndSaveLobbies();
    }, []);

    function handleSearchByNameStateChange() {
        setSearchByNameState(!searchByNameState);
        setSearchByNameQuery("")
    }

    function handleSearchByPlayerCStateChange() {
        setSearchByPlayerCState(!searchByPlayerCState);
        setSearchByPlayerCQuery(0)
    }

    function handleResetQuerys() {
        setSearchByNameState(false);
        setSearchByPlayerCState(false);
        setSearchByNameQuery("");
        setSearchByPlayerCQuery(0);
    }

    const filteredLobbies = useMemo(
        () => {
            if (searchByNameQuery && !searchByPlayerCQuery) {
                return lobbies.filter(l => l.lobby_name.toLowerCase().includes(searchByNameQuery))
            } else if (!searchByNameQuery && searchByPlayerCQuery) {
                return lobbies.filter(l => l.player_amount == searchByPlayerCQuery)
            } else if (searchByNameQuery && searchByPlayerCQuery) {
                return lobbies.filter(l => l.lobby_name.toLowerCase().includes(searchByNameQuery) && l.player_amount == searchByPlayerCQuery)
            } else {
                return lobbies
            }
        },
        [lobbies, searchByPlayerCQuery, searchByNameQuery]
    );

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
            searchByNameQuery={searchByNameQuery}
            searchByPlayerCQuery={searchByPlayerCQuery}
            onSearchNameQueryChange={setSearchByNameQuery}
            onSearchPlayerQueryChange={setSearchByPlayerCQuery}
            searchByNameState={searchByNameState}
            searchByPlayerCState={searchByPlayerCState}
            onChangeSearchByNameState={handleSearchByNameStateChange}
            onChangeSearchByPCState={handleSearchByPlayerCStateChange}
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
