type Player = {
    name: string;
    id: string;
}

export interface LobbyLayoutProps {
    playerId: string;
    players: Player[];
}

function LobbyLayout({ players, playerId }: LobbyLayoutProps) {
    const playerList = players.map(p => (
        <li
            key={p.id}
            className={(p.id === playerId) ? "text-red-600" : ""}
        >
            {p.name}
        </li>
    ));

    return <div>
        <ul>
            { playerList }
        </ul>
    </div>;
}

export default LobbyLayout;
