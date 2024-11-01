import { useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import FilledButton from "../../../components/FilledButton";
import LobbyList, { LobbyElement } from "./LobbyList";
import LobbysFilter from "./LobbysFilter";
import TextButton from "../../../components/TextButton";
import { classNames } from "../../../util";

interface MainPageLayoutProps {
    searchQuery: string;
    playerCountRange: [number, number];
    onSearchQueryChange: (searchQuery: string) => void;
    onPlayerCountRangeChange: (playerCountRange: [number, number]) => void;
    onClearFilters: () => void;
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
    lobbies: LobbyElement[];
    refreshHandler: () => void;
    joinHandler: (lobbyId: string) => void;
}

function MainPageLayout({
    searchQuery,
    playerCountRange,
    onSearchQueryChange,
    onPlayerCountRangeChange,
    onClearFilters,
    onSubmitLobbyForm,
    lobbies,
    refreshHandler,
    joinHandler,
}: MainPageLayoutProps) {
    const [showCreateLobbyDialog, setShowCreateLobbyDialog] = useState<boolean>(false);
    const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);

    return (
        <>
            <div className="flex w-screen h-screen justify-center items-center">
                <div className="flex flex-row bg-surface min-w-[60%] min-h-[75%] rounded-xl border border-border">
                    <div className="grow-[1] border-r border-border">
                        <div className="flex flex-row w-full justify-between items-center pt-6 px-6">
                            <h2 className="text-2xl">Lista de salas</h2>
                            <TextButton
                                onClick={refreshHandler}
                                padding="py-2"
                            >
                                Refrescar
                            </TextButton>
                        </div>
                        <table className="w-full mt-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-2 text-start w-full">Nombre</th>
                                    <th className="px-6 py-2 whitespace-nowrap">Jugadores</th>
                                    <th className="px-6 py-2 whitespace-nowrap">Tipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lobbies.map(l => (
                                    <tr
                                        key={l.lobby_id}
                                        className={classNames(["px-6 py-2", selectedLobbyId === l.lobby_id ? "bg-white/35" : "hover:bg-white/25"])}
                                        onClick={() => setSelectedLobbyId(id => id === l.lobby_id ? null : l.lobby_id)}
                                        onDoubleClick={() => joinHandler(l.lobby_id)}
                                    >
                                        <td className="px-6 py-2 ">{l.lobby_name}</td>
                                        <td className="px-6 py-2 text-center">{l.player_amount} / {l.max_players}</td>
                                        <td className="px-6 py-2 text-center">Pública</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="w-[30%] flex flex-col p-6 gap-4">
                        <div className="flex flex-row w-full justify-between items-center">
                            <h2 className="text-2xl">Filtros</h2>
                            <TextButton
                                padding="py-2"
                            >
                                Limpiar
                            </TextButton>
                        </div>

                        <LobbysFilter
                            playerCountRange={[0, 3]}
                            onPlayerCountRangeChange={() => {}}
                            lobbyNameValue=""
                            onLobbyNameChange={() => {}}
                            className="w-full"
                        />
                        <div className="grow"></div>
                        <FilledButton onClick={() => setShowCreateLobbyDialog(true)}>Crear sala</FilledButton>
                        <FilledButton
                            onClick={() => {
                                if (selectedLobbyId != null) {
                                    joinHandler(selectedLobbyId);
                                }
                            }}
                            enabled={selectedLobbyId != null}
                            title={selectedLobbyId == null ? "Antes debes seleccionar una sala" : undefined}
                        >
                            Unirse a la sala
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
        </>
    );
}

export default MainPageLayout;
