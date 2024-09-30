type Player = {
    name: string;
    id: string;
}

export interface LobbyLayoutProps {
    playerId: string;
    players: Player[];
    lobbyName: string;
}

function LobbyLayout({ players, playerId, lobbyName }: LobbyLayoutProps) {
    const playerList = players.map(p => (
        <li
            key={p.id}
            className={(p.id === playerId) ? "text-red-600" : ""}
        >
            {p.name}
        </li>
    ));

    return <div className="flex flex-col items-center w-screen">
        <h2>Jugadores en { "\"" + lobbyName + "\""}:</h2>
        <ul>
            { playerList }
        </ul>
    </div>;
}

export default LobbyLayout;
