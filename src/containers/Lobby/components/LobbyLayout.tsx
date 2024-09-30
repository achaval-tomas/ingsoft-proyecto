import FilledButton from "../../../components/FilledButton";

type Player = {
    name: string;
    id: string;
}

export interface LobbyLayoutProps {
    playerId: string;
    players: Player[];
    lobbyName: string;
    canStart: boolean;
    quitHandler: () => void;
    startHandler: () => void;
}

function LobbyLayout({ players, playerId, lobbyName, canStart, quitHandler, startHandler }: LobbyLayoutProps) {
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
            <FilledButton onClick={quitHandler}>
                Salir
            </FilledButton>
            { canStart &&
                <FilledButton onClick={startHandler}>
                    Iniciar juego
                </FilledButton>
            }
        </div>
    </div>;
}

export default LobbyLayout;
