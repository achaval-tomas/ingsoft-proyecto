import { LobbyElement } from "../../../services/lobbyService";
import { classNames } from "../../../util";

interface LobbyListProps {
    lobbies: LobbyElement[] | null;
    selectedLobbyId: string | null;
    isFiltered: boolean;
    onSelectLobby: (id: string) => void;
    onJoinLobby: (id: string) => void;
}

export default function LobbyList({ lobbies, selectedLobbyId, isFiltered, onSelectLobby, onJoinLobby }: LobbyListProps) {
    return (
        <div className="flex w-full grow justify-center items-start overflow-y-auto" data-testid="lobby-list">
            {lobbies == null ? (
                <p className="animate-pulse self-center" data-testid="lobby-list-loading">Cargando salas...</p>
            ) : (lobbies.length === 0) ? (
                <p className="self-center" data-testid="lobby-list-no-lobbies">
                    {isFiltered
                        ? "Ninguna sala coincide con los filtros."
                        : "No se encontró ninguna sala."}
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
                        {lobbies.map(l => (
                            <tr
                                key={l.lobby_id}
                                className={classNames(["px-6 py-2", selectedLobbyId === l.lobby_id ? "bg-white/35" : "hover:bg-white/25"])}
                                onClick={() => onSelectLobby(l.lobby_id)}
                                onDoubleClick={() => onJoinLobby(l.lobby_id)}
                                data-testid="lobby-item"
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
    );
}
