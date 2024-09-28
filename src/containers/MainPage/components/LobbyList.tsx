export interface LobbyElement {
    id: string;
    name: string;
    numPlayers: number;
}

interface LobbyListProps {
    joinHandler: (id: string) => void;
    lobbyList: LobbyElement[];
}

export default function LobbyList({ lobbyList, joinHandler }: LobbyListProps) {
    const items = lobbyList.map(lobby =>
        <tr
            className="my-2 p-2 border"
            key={lobby.id}
        >
            <td className="text-center">{lobby.name}</td>
            <td className="text-center">{lobby.numPlayers}</td>
            <td>
                <button
                    className="p-1 rounded bg-primary-600 hover:bg-primary-500"
                    onClick={() => joinHandler(lobby.id)}
                >
                    Unirse
                </button>
            </td>
        </tr>,
    );

    return <table className="w-screen">
        <thead>
            <tr>
                <th>Nombre de la sala</th>
                <th>Cantidad de jugadores</th>
            </tr>
        </thead>
        <tbody>
            {items}
        </tbody>
    </table>;
}
