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
        <li key={lobby.id} >
            <div
                className="flex justify-around my-2"
            >
                <p><b>{lobby.name}</b></p>
                <p>{lobby.numPlayers}</p>
                <button
                    className="p-1 rounded bg-primary-600 hover:bg-primary-500"
                    onClick={() => joinHandler(lobby.id)}
                >
                    Unirse
                </button>

            </div>
        </li>,
    );

    return <ul className="w-screen">
        {items}
    </ul>;
}
