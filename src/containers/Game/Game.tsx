import { useEffect, useMemo, useRef, useState } from "react";
import GameLayout from "./GameLayout";
import { GameMessageInSchema, GameMessageOut } from "../../domain/GameMessage";
import { CommonPlayerState, GameState } from "../../domain/GameState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpServerUrl, wsServerUrl } from "../../services/config";
import ConfirmDialog from "../../components/ConfirmDialog";
import Dialog from "../../components/Dialog";
import FilledButton from "../../components/FilledButton";

function computeNextPlayer(s: GameState): number {
    const allPlayers: CommonPlayerState[] = [s.selfPlayerState, ...s.otherPlayersState];
    allPlayers.sort((lhs, rhs) => lhs.roundOrder - rhs.roundOrder);

    const nextPlayer = allPlayers.find(p => p.roundOrder > s.currentRoundPlayer) ?? allPlayers[0];

    return nextPlayer.roundOrder;
}

function Game() {
    const [searchParams] = useSearchParams();
    const playerId = useMemo(() => searchParams.get("player")!, [searchParams]);
    const navigate = useNavigate();

    const wsRef = useRef<WebSocket | null>(null);

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);
    const [winner, setWinner] = useState<CommonPlayerState | null>(null);

    useEffect(() => {
        setGameState(null);

        const ws = new WebSocket(`${wsServerUrl}/game/${playerId}`);
        wsRef.current = ws;

        ws.addEventListener("message", e => {
            if (typeof e.data !== "string") {
                console.error("invalid message type");
                return;
            }

            const message = GameMessageInSchema.parse(JSON.parse(e.data));

            console.log(message);

            switch (message.type) {
                case "turn-ended": {
                    setGameState(s => {
                        if (s === null) {
                            return null;
                        }

                        const newGameState = { ...s };
                        newGameState.currentRoundPlayer = computeNextPlayer(newGameState);

                        return newGameState;
                    });
                    break;
                }
                case "player-won": {
                    setGameState(s => {
                        if (s === null) {
                            return null;
                        }

                        const allPlayers: CommonPlayerState[] = [s.selfPlayerState, ...s.otherPlayersState];
                        const winner = allPlayers.find(p => p.id === message.playerId);

                        setWinner(winner ?? null);
                        return s;
                    });
                    break;
                }
                case "game-state": {
                    setGameState(message.gameState);
                    break;
                }
                case "error": {
                    // TODO
                    break;
                }
                case "player-left": {
                    setGameState(s => {
                        if (message.playerId === playerId) {
                            navigate(`/lobby?player=${playerId}`);
                            return s;
                        }

                        if (s === null) {
                            return null;
                        }

                        const newGameState = { ...s, otherPlayersState: s.otherPlayersState.filter(p => p.id !== message.playerId) };

                        const player = s.otherPlayersState.find(p => p.id === message.playerId);
                        if (player != null && player.roundOrder === s.currentRoundPlayer) {
                            newGameState.currentRoundPlayer = computeNextPlayer(newGameState);
                        }

                        return newGameState;
                    });
                    break;
                }
                default:
                    message satisfies never;
            }
        });

        return () => ws.close();
    }, [playerId, navigate]);

    const handleEndTurn = () => {
        const message: GameMessageOut = {
            type: "end-turn",
        };
        wsRef.current?.send(JSON.stringify(message));
    };

    const handleLeaveGame = () => {
        void fetch(`${httpServerUrl}/game/leave`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ playerId }),
        });
        navigate(`/lobby?player=${playerId}`);
    };

    if (gameState === null) {
        return <p>Loading...</p>;
    }

    const activeSide = playerIndexToActiveSide(
        [gameState.selfPlayerState, ...gameState.otherPlayersState]
            .findIndex(p => p.roundOrder === gameState.currentRoundPlayer),
    );

    return (
        <>
            <GameLayout
                tiles={gameState.boardState.tiles}
                selfPlayerState={gameState.selfPlayerState}
                otherPlayersState={gameState.otherPlayersState}
                activeSide={activeSide}
                onClickEndTurn={handleEndTurn}
                onClickLeaveGame={() => setShowLeaveGameDialog(true)}
            />
            <ConfirmDialog
                isOpen={showLeaveGameDialog}
                title="Abandonar"
                body="Abandonar partida?"
                dismissText="Cancelar"
                confirmText="Abandonar"
                onDismiss={() => setShowLeaveGameDialog(false)}
                onConfirm={handleLeaveGame}
            />
            {(winner != null) && <Dialog
                isOpen={true}
                onClose={() => navigate(`/lobby?player=${playerId}`)}
            >
                <div className="flex flex-col justify-center text-center gap-8">
                    <p className="text-xl">¡{winner.name} ganó!</p>
                    <FilledButton onClick={() => navigate(`/lobby?player=${playerId}`)}>
                        OK
                    </FilledButton>
                </div>
            </Dialog>}
        </>
    );
}

function playerIndexToActiveSide(index: number): "b" | "r" | "t" | "l" {
    switch (index) {
        case 0: return "b";
        case 1: return "r";
        case 2: return "t";
        case 3: return "l";
        default: return "b";
    }
}

export default Game;
