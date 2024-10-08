import AppState from "../domain/AppState";
import { GameState, getAllPlayers } from "../domain/GameState";
import { getTargetFromPositionClamped } from "../domain/Movement";
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
            const newGameState = { ...gameState };

            const swp1 = positionToBoardIndex(action.position);
            const swp2 = positionToBoardIndex(getTargetFromPositionClamped(action.movement, action.rotation, action.position));

            const tmp = newGameState.boardState.tiles[swp1];
            newGameState.boardState.tiles[swp1] = newGameState.boardState.tiles[swp2];
            newGameState.boardState.tiles[swp2] = tmp;

            return newGameState;
        }
    }
}

function rootReducer(state: AppState | undefined, action: Action): AppState {
    if (state == null) { // we provide an initial value for state, so it should never be null.
        throw new Error(`store state is ${state}`);
    }

    return { ...state, gameState: gameStateReducer(state.gameState, action) };
}

export default rootReducer;
