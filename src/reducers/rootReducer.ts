import AppState from "../domain/AppState";
import { GameState, getAllPlayers } from "../domain/GameState";
import { getTargetFromPositionClamped, Movement } from "../domain/Movement";
import { positionToBoardIndex } from "../domain/Position";
import Action from "./Action";

function computeNextPlayer(s: GameState): number {
    const allPlayers = getAllPlayers(s).toSorted((lhs, rhs) => lhs.roundOrder - rhs.roundOrder);
    const nextPlayer = allPlayers.find(p => p.roundOrder > s.currentRoundPlayer) ?? allPlayers[0];

    return nextPlayer.roundOrder;
}

function gameStateReducer(gameState: GameState | null, action: Action): GameState | null {
    if (action.type === "game-state") {
        return action.gameState;
    }

    if (action.type === "clear-game-state") {
        return null;
    }

    if (gameState == null) {
        return gameState;
    }

    switch (action.type) {
        case "turn-ended": {
            const newGameState = { ...gameState };

            if (action.playerId === gameState.selfPlayerState.id) {
                newGameState.selfPlayerState.shapeCardsInHand = action.newShapeCards;
                newGameState.selfPlayerState.movementCardsInHand = action.newMovementCards ?? [];
            } else {
                const dealtPlayer = newGameState.otherPlayersState.find(p => p.id === action.playerId);

                if (dealtPlayer != null) {
                    dealtPlayer.shapeCardsInHand = action.newShapeCards;
                }
            }

            newGameState.currentRoundPlayer = computeNextPlayer(newGameState);

            return newGameState;
        }
        case "player-won": {
            const newGameState = { ...gameState };
            newGameState.winner = action.playerId;

            return newGameState;
        }
        case "error": {
            // TODO
            return gameState;
        }
        case "player-left": {
            const newGameState = { ...gameState };
            newGameState.otherPlayersState = newGameState.otherPlayersState.filter(p => p.id !== action.playerId);

            const player = gameState.otherPlayersState.find(p => p.id === action.playerId);
            if (player != null && player.roundOrder === gameState.currentRoundPlayer) {
                newGameState.currentRoundPlayer = computeNextPlayer(newGameState);
            }

            return newGameState;
        }
        case "movement-card-used": {
            const { movement, position, rotation } = action;

            const swp1 = positionToBoardIndex(position);
            const swp2 = positionToBoardIndex(getTargetFromPositionClamped(movement, rotation, position));

            const newGameState: GameState = {
                ...gameState,
                selfPlayerState: {
                    ...gameState.selfPlayerState,
                    movementCardsInHand: filterFirstMovement(gameState.selfPlayerState.movementCardsInHand, movement),
                },
                boardState: {
                    ...gameState.boardState,
                    tiles: gameState.boardState.tiles.map((c, i) => {
                        switch (i) {
                            case swp1: return gameState.boardState.tiles[swp2];
                            case swp2: return gameState.boardState.tiles[swp1];
                            default: return c;
                        }
                    }),
                },
                temportalMovements: [
                    { movement: movement, position: position, rotation: rotation },
                    ...gameState.temportalMovements ?? [],
                ],
            };

            return newGameState;
        }
    }
}

function filterFirstMovement(movements: readonly Movement[], movement: Movement): Movement[] {
    const movementIndex = movements.findIndex(m => m === movement);
    return movements.filter((_, i) => i !== movementIndex);
}

function rootReducer(state: AppState | undefined, action: Action): AppState {
    if (state == null) { // we provide an initial value for state, so it should never be null.
        throw new Error(`store state is ${state}`);
    }

    return { ...state, gameState: gameStateReducer(state.gameState, action) };
}

export default rootReducer;
