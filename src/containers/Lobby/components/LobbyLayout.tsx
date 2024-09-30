import FilledButton from "../../../components/FilledButton";

type Player = {
    name: string;
    id: string;
}

export interface LobbyLayoutProps {
    playerId: string;
    players: Player[];
    lobbyName: string;
    isOwner: boolean;
}

function LobbyLayout({ players, playerId, lobbyName, isOwner }: LobbyLayoutProps) {
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
        <div className="flex justify-center">
            <FilledButton>
                Salir
            </FilledButton>
            { isOwner &&
                <FilledButton>
                    Iniciar juego
                </FilledButton>
            }
        </div>
    </div>;
}

export default LobbyLayout;
