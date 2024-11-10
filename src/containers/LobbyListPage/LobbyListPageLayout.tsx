import { useCallback, useMemo, useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./components/CreateLobbyDialog";
import FilledButton from "../../components/FilledButton";
import LobbyFilters from "./components/LobbyFilters";
import TextButton from "../../components/TextButton";
import { LobbyElement } from "../../services/lobbyService";
import LobbyList from "./components/LobbyList";
import { JoinedGame } from "../../services/gameService";
import JoinedGameList from "./components/JoinedGameList";
import EnterPasswordDialog from "./components/EnterPasswordDialog";

const defaultPlayerCountRange: [number, number] = [1, 3];

interface LobbyListPageLayoutProps {
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
    joinedGames: JoinedGame[] | null;
    lobbies: LobbyElement[] | null;
    onRefresh: () => void;
    onJoinLobby: (lobbyId: string, password: string) => void;
}

function LobbyListPageLayout({
    onSubmitLobbyForm,
    joinedGames,
    lobbies,
    onRefresh,
    onJoinLobby,
}: LobbyListPageLayoutProps) {
    const [showCreateLobbyDialog, setShowCreateLobbyDialog] = useState<boolean>(false);
    const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [playerCountRange, setPlayerCountRange] = useState<[number, number]>(defaultPlayerCountRange);

    const [enterPasswordDialogLobbyId, setEnterPasswordDialogLobbyId] = useState<string | null>(null);

    const filteredLobbies = useMemo(
        () => (lobbies != null)
            ? lobbies
                .filter(l => l.lobby_name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(l => playerCountRange[0] <= l.player_amount && l.player_amount <= playerCountRange[1])
                .sort((lhs, rhs) => Number(rhs.joined) - Number(lhs.joined))
            : null,
        [lobbies, searchQuery, playerCountRange],
    );

    function handleClearFilters() {
        setSearchQuery("");
        setPlayerCountRange(defaultPlayerCountRange);
    }

    const onJoinLobbyMiddleware = useCallback((lobbyId: string) => {
        if (lobbies == null) {
            onJoinLobby(lobbyId, "");
            return;
        }

        const lobby = lobbies.find(l => l.lobby_id === lobbyId);
        if (lobby == null) {
            onJoinLobby(lobbyId, "");
            return;
        }

        if (lobby.joined || false) {
            onJoinLobby(lobbyId, "");
            return;
        }

        setEnterPasswordDialogLobbyId(lobbyId);
    }, [lobbies, onJoinLobby]);

    return (
        <>
            <div className="flex w-screen h-screen justify-center items-center">
                <div className="flex flex-row bg-surface min-w-[60%] h-[75%] rounded-xl border border-border">
                    <div className="flex flex-col grow-[1] h-full border-r border-border">
                        <div className="flex flex-col flex-1 border-b border-border pb-2">
                            <div className="flex flex-row w-full justify-between items-center pt-6 px-6">
                                <h2 className="text-2xl">Partidas unidas</h2>
                                <TextButton
                                    onClick={onRefresh}
                                    padding="py-2"
                                >
                                Refrescar
                                </TextButton>
                            </div>
                            <JoinedGameList
                                lobbies={joinedGames}
                                selectedGameId={selectedLobbyId}
                                onSelectGame={lid => setSelectedLobbyId(slid => (slid === lid) ? null : lid)}
                                onJoinGame={onJoinLobbyMiddleware}
                            />
                        </div>
                        <div className="flex flex-col grow-[1]">
                            <div className="flex flex-row w-full justify-between items-center pt-4 px-6">
                                <h2 className="text-2xl">Salas</h2>
                            </div>
                            <LobbyList
                                lobbies={filteredLobbies}
                                selectedLobbyId={selectedLobbyId}
                                isFiltered={filteredLobbies?.length !== lobbies?.length}
                                onSelectLobby={lid => setSelectedLobbyId(slid => (slid === lid) ? null : lid)}
                                onJoinLobby={onJoinLobbyMiddleware}
                            />
                        </div>
                    </div>
                    <div className="w-[30%] flex flex-col p-6 gap-4">
                        <div className="flex flex-row w-full justify-between items-center">
                            <h2 className="text-2xl">Filtros</h2>
                            <TextButton
                                padding="py-2"
                                onClick={handleClearFilters}
                            >
                                Limpiar
                            </TextButton>
                        </div>

                        <LobbyFilters
                            playerCountRange={playerCountRange}
                            onChangePlayerCountRange={setPlayerCountRange}
                            lobbyName={searchQuery}
                            onChangeLobbyName={setSearchQuery}
                            className="w-full"
                        />
                        <div className="grow"></div>
                        <FilledButton onClick={() => setShowCreateLobbyDialog(true)}>Crear sala</FilledButton>
                        <FilledButton
                            onClick={() => {
                                if (selectedLobbyId != null) {
                                    onJoinLobbyMiddleware(selectedLobbyId);
                                }
                            }}
                            enabled={selectedLobbyId != null}
                            title={selectedLobbyId == null ? "Antes debes seleccionar una sala" : undefined}
                        >
                            Unirse a la partida
                        </FilledButton>
                    </div>

                </div>
            </div>
            <CreateLobbyDialog
                isOpen={showCreateLobbyDialog}
                lobbyNamePlaceholder={"Nombre de tu sala"}
                onCancel={() => setShowCreateLobbyDialog(false)}
                onSubmit={onSubmitLobbyForm}
            />
            <EnterPasswordDialog
                isOpen={enterPasswordDialogLobbyId != null}
                lobbyName={lobbies?.find(l => l.lobby_id === enterPasswordDialogLobbyId)?.lobby_name ?? ""}
                onCancel={() => setEnterPasswordDialogLobbyId(null)}
                onSubmit={(password) => onJoinLobby(enterPasswordDialogLobbyId!, password)}
            />
        </>
    );
}

export default LobbyListPageLayout;
