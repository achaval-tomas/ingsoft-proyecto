import { useEffect, useState } from "react";
import GameLayout from "./GameLayout";
import { Movement } from "../../domain/Movement";
import { Shape } from "../../domain/Shape";
import { GameMessageInSchema } from "../../domain/GameMessage";
import { CommonPlayerState, GameState } from "../../domain/GameState";

function Game() {
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080/game?user=asdqwe");

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
    }, []);

    if (gameState === null) {
        return <p>Loading...</p>;
    }

    const tiles = gameState.boardState.tiles;
    const movements = gameState.selfPlayerState.movementCardsInHand;
    const shapes = gameState.selfPlayerState.shapeCardsInHand;

    return (
        <GameLayout
            tiles={tiles}
            movements={movements as [Movement, Movement, Movement]}
            shapes={shapes.map(s => s.shape) as [Shape, Shape, Shape]}
        />
    );
}

export default Game;