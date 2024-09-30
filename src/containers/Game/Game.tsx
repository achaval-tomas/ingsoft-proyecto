import { useEffect, useRef, useState } from "react";
import GameLayout from "./GameLayout";
import { GameMessageInSchema, GameMessageOut } from "../../domain/GameMessage";
import { CommonPlayerState, GameState } from "../../domain/GameState";
import { useSearchParams } from "react-router-dom";

const serverUrl = "ws://localhost:8080";

function Game() {
    const [searchParams] = useSearchParams();
    const wsRef = useRef<WebSocket | null>(null);

    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        setGameState(null);

        const ws = new WebSocket(`${serverUrl}/game?user=${searchParams.get("user")}`);
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

                        const allPlayers: CommonPlayerState[] = [s.selfPlayerState, ...s.otherPlayersState];
                        allPlayers.sort((lhs, rhs) => lhs.roundOrder - rhs.roundOrder);

                        const nextPlayer = allPlayers.find(p => p.roundOrder > s.currentRoundPlayer) ?? allPlayers[0];

                        const newGameState = { ...s };
                        newGameState.currentRoundPlayer = nextPlayer.roundOrder;

                        return newGameState;
                    });
                    break;
                }
                case "winner": {
                    setGameState(s => {
                        if (s === null) {
                            return null;
                        }

                        const allPlayers: CommonPlayerState[] = [s.selfPlayerState, ...s.otherPlayersState];
                        const winner = allPlayers.find(p => p.id === message.playerId);

                        alert(`¡${winner?.name} ganó!`);
                        return s;
                    });
                    break;
                }
                case "game-state": {
                    setGameState(message.gameState);
                    break;
                }
            }
        });

        return () => ws.close();
    }, [searchParams]);

    const handleEndTurn = () => {
        const message: GameMessageOut = {
            type: "end-turn",
        };
        wsRef.current?.send(JSON.stringify(message));
    };

    if (gameState === null) {
        return <p>Loading...</p>;
    }

    const activeSide = playerIndexToActiveSide(
        [gameState.selfPlayerState, ...gameState.otherPlayersState]
            .findIndex(p => p.roundOrder === gameState.currentRoundPlayer),
    );

    return (
        <GameLayout
            tiles={gameState.boardState.tiles}
            selfPlayerState={gameState.selfPlayerState}
            otherPlayersState={gameState.otherPlayersState}
            activeSide={activeSide}
            onClickEndTurn={handleEndTurn}
        />
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