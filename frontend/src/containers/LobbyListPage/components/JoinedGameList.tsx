import { JoinedGame } from "../../../services/gameService";
import { classNames } from "../../../util";

interface JoinedGameListProps {
    lobbies: JoinedGame[] | null;
    selectedGameId: string | null;
    onSelectGame: (id: string) => void;
    onJoinGame: (id: string) => void;
}

export default function JoinedGameList({ lobbies, selectedGameId, onSelectGame, onJoinGame }: JoinedGameListProps) {
    return (
        <div className="flex w-full grow justify-center items-start overflow-y-auto" data-testid="lobby-list">
            {lobbies == null ? (
                <p className="animate-pulse self-center" data-testid="lobby-list-loading">Cargando partidas...</p>
            ) : (lobbies.length === 0) ? (
                <p className="self-center" data-testid="lobby-list-no-lobbies">No te encuentras en ninguna partida.</p>
            ) : (
                <table className="w-full mt-2">
                    <thead>
                        <tr>
                            <th className="px-6 py-2 text-start w-full">Nombre</th>
                            <th className="px-6 py-2 whitespace-nowrap">Jugadores en partida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lobbies.map(g => (
                            <tr
                                key={g.id}
                                className={classNames(["px-6 py-2", selectedGameId === g.id ? "bg-white/35" : "hover:bg-white/25"])}
                                onClick={() => onSelectGame(g.id)}
                                onDoubleClick={() => onJoinGame(g.id)}
                                data-testid="lobby-item"
                            >
                                <td className="px-6 py-2 ">{g.name}</td>
                                <td className="px-6 py-2 text-center">{g.playerCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
