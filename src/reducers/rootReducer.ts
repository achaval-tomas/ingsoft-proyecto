import AppState from "../domain/AppState";
import { GameMessageIn } from "../domain/GameMessage";
import { GameState, getAllPlayers } from "../domain/GameState";

function computeNextPlayer(s: GameState): number {
    const allPlayers = getAllPlayers(s).toSorted((lhs, rhs) => lhs.roundOrder - rhs.roundOrder);
    const nextPlayer = allPlayers.find(p => p.roundOrder > s.currentRoundPlayer) ?? allPlayers[0];

    return nextPlayer.roundOrder;
}

function gameStateReducer(gameState: GameState | null, action: GameMessageIn): GameState | null {
    if (action.type === "game-state") {
        return action.gameState;
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
        case "winner": {
            const newGameState = { ...gameState };
            newGameState.winner = action.playerId;

            return newGameState;
        }
        case "error": {
            // TODO
            return gameState;
        }
        case "player-left": {
            // if (action.playerId === s.selfPlayerState.id) {
            //     navigate(`/lobby?player=${playerId}`);
            //     return s;
            // }

            const newGameState = { ...gameState };
            newGameState.otherPlayersState = newGameState.otherPlayersState.filter(p => p.id !== action.playerId);

            const player = gameState.otherPlayersState.find(p => p.id === action.playerId);
            if (player != null && player.roundOrder === gameState.currentRoundPlayer) {
                newGameState.currentRoundPlayer = computeNextPlayer(newGameState);
            }

            return newGameState;
        }
    }
}

function rootReducer(state: AppState | undefined, action: GameMessageIn): AppState {
    if (state == null) { // we provide an initial value for state, so it should never be null.
        throw new Error(`store state is ${state}`);
    }

    return { ...state, gameState: gameStateReducer(state.gameState, action) };
}

export default rootReducer;