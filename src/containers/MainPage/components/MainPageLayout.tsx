import { useMemo, useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import FilledButton from "../../../components/FilledButton";
import { LobbyElement } from "./LobbyList";
import LobbyFilters from "./LobbyFilters";
import TextButton from "../../../components/TextButton";
import { classNames } from "../../../util";

const defaultPlayerCountRange: [number, number] = [1, 3];

interface MainPageLayoutProps {
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
    lobbies: LobbyElement[] | null;
    refreshHandler: () => void;
    joinHandler: (lobbyId: string) => void;
}

function MainPageLayout({
    onSubmitLobbyForm,
    lobbies,
    refreshHandler,
    joinHandler,
}: MainPageLayoutProps) {
    const [showCreateLobbyDialog, setShowCreateLobbyDialog] = useState<boolean>(false);
    const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [playerCountRange, setPlayerCountRange] = useState<[number, number]>(defaultPlayerCountRange);

    const filteredLobbies = useMemo(
        () => (lobbies != null)
            ? lobbies
                .filter(l => l.lobby_name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(l => playerCountRange[0] <= l.player_amount && l.player_amount <= playerCountRange[1])
            : null,
        [lobbies, searchQuery, playerCountRange],
    );

    function handleClearFilters() {
        setSearchQuery("");
        setPlayerCountRange(defaultPlayerCountRange);
    }

    return (
        <>
            <div className="flex w-screen h-screen justify-center items-center">
                <div className="flex flex-row bg-surface min-w-[60%] h-[75%] rounded-xl border border-border">
                    <div className="flex flex-col grow-[1] border-r border-border">
                        <div className="flex flex-row w-full justify-between items-center pt-6 px-6">
                            <h2 className="text-2xl">Lista de salas</h2>
                            <TextButton
                                onClick={refreshHandler}
                                padding="py-2"
                            >
                                Refrescar
                            </TextButton>
                        </div>
                        <div className="flex w-full grow justify-center items-start overflow-y-auto">
                            {filteredLobbies == null ? (
                                <p className="animate-pulse self-center">Cargando salas...</p>
                            ) : (filteredLobbies.length === 0) ? (
                                <p className="self-center">
                                    {(lobbies!.length === 0)
                                        ? "No se encontró ninguna sala."
                                        : "Ninguna sala coincide con los filtros."
                                    }
                                </p>
                            ) : (
                                <table className="w-full mt-2">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-start w-full">Nombre</th>
                                            <th className="px-6 py-2 whitespace-nowrap">Jugadores</th>
                                            <th className="px-6 py-2 whitespace-nowrap">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLobbies.map(l => (
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
                            )}
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
                            onPlayerCountRangeChange={setPlayerCountRange}
                            lobbyNameValue={searchQuery}
                            onLobbyNameChange={setSearchQuery}
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
