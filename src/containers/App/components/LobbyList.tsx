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
            className="flex justify-around my-2 p-2 border items-baseline"
            key={lobby.id}
        >
            <td><b>{lobby.name}</b></td>
            <td>{lobby.numPlayers}</td>
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
        <tbody>
            {items}
        </tbody>
    </table>;
}
