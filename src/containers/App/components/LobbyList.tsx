export interface LobbyElement {
    id: string;
    name: string;
    numPlayers: number;
}

interface LobbyListProps {
    joinHandler: (id: string) => void;
    lobbyList: LobbyElement[];
}

export default function LobbyList({ lobbyList }: LobbyListProps) {
    const items = lobbyList.map(lobby =>
        <li key={lobby.id} >
            <div
                className="flex justify-around"
            >
                <p><b>{lobby.name}</b></p>
                <p>{lobby.numPlayers}</p>
            </div>
        </li>,
    );

    return <ul className="w-screen">
        {items}
    </ul>;
}
