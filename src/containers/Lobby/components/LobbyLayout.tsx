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
    isOwner: boolean;
}

function LobbyLayout({ players, playerId, lobbyName, canStart, quitHandler, startHandler, isOwner }: LobbyLayoutProps) {
    const playerList = players.map(p => (
        <div key={p.id} className="flex">
            <p className="text-lg">
                &bull;&nbsp;{p.name}
                { p.id === playerId &&
                    <span className="text-sm italic">
                        &nbsp;(Tú)
                    </span>
                }
            </p>
        </div>
    ));

    return <div className="flex justify-center w-screen">
        <div className="w-7/12 bg-surface rounded-lg border border-border flex flex-col items-center gap-7 p-8 shadow-xl shadow-surface">
            <h2 className="text-2xl font-bold">
                {lobbyName}
            </h2>
            <div>
                <p>Jugadores:</p>
                { playerList }
            </div>
            { !isOwner &&
                <p className="text-sm text-gray-500">
                    Esperando a que el host inicie la partida
                </p>
            }
            <div className="flex gap-6 w-full px-14">
                <FilledButton
                    onClick={quitHandler}
                    className="px-2 flex-1"
                >
                    Salir
                </FilledButton>
                { canStart &&
                    <FilledButton
                        onClick={startHandler}
                        className="px-2 flex-1"
                    >
                        Iniciar juego
                    </FilledButton>
                }
            </div>
        </div>
    </div>;
}

export default LobbyLayout;
