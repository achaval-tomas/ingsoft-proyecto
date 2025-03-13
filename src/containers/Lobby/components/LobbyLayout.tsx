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

    return <div className="w-full h-full grid place-content-center">
        <div className="flex flex-col min-w-96 items-center gap-6 p-6 bg-surface border border-border rounded-lg">
            <h2 className="text-2xl font-bold">
                {lobbyName}
            </h2>
            <div>
                <p>Jugadores:</p>
                {playerList}
            </div>
            {!isOwner && <p className="text-sm text-gray-500">
                Esperando a que el host inicie la partida
            </p>}
            <div className="flex gap-6 w-full">
                <FilledButton
                    onClick={quitHandler}
                    className="flex-1"
                >
                    Salir
                </FilledButton>
                {isOwner && <FilledButton
                    onClick={startHandler}
                    className="flex-1"
                    enabled={canStart}
                >
                    Iniciar juego
                </FilledButton>}
            </div>
        </div>
    </div>;
}

export default LobbyLayout;
