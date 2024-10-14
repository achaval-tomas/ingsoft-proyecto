import AppState from "../domain/AppState";
import { Color } from "../domain/Color";
import { GameState, getAllPlayers, OtherPlayerState, SelfPlayerState } from "../domain/GameState";
import { getTargetFromPositionClamped, Movement } from "../domain/Movement";
import { Position, positionToBoardIndex } from "../domain/Position";
import { Rotation } from "../domain/Rotation";
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

            if (gameState.temporalMovements.length > 0) {
                const newBoardState = { ...gameState.boardState, tiles: [...gameState.boardState.tiles] };

                for (let i = gameState.temporalMovements.length - 1; i >= 0; --i) {
                    const { movement, position, rotation } = gameState.temporalMovements[i];

                    newBoardState.tiles = getTilesWithMovementDone(movement, position, rotation, newBoardState.tiles);
                }

                newGameState.boardState = newBoardState;
            }

            newGameState.temporalMovements = [];

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

            const newSelfPlayerState: SelfPlayerState = { ...gameState.selfPlayerState };

            if (gameState.currentRoundPlayer === gameState.selfPlayerState.roundOrder) {
                newSelfPlayerState.movementCardsInHand = filterFirstMovement(gameState.selfPlayerState.movementCardsInHand, movement);
            }

            const newOtherPlayerState = changeOtherPlayerState(
                gameState.otherPlayersState,
                p => p.roundOrder === gameState.currentRoundPlayer,
                p => ({
                    ...p,
                    movementCardsInHandCount: p.movementCardsInHandCount - 1,
                }),
            );

            const newGameState: GameState = {
                ...gameState,
                selfPlayerState: newSelfPlayerState,
                otherPlayersState: newOtherPlayerState,
                boardState: {
                    ...gameState.boardState,
                    tiles: getTilesWithMovementDone(movement, position, rotation, gameState.boardState.tiles),
                },
                temporalMovements: [
                    ...gameState.temporalMovements,
                    { movement: movement, position: position, rotation: rotation },
                ],
            };

            return newGameState;
        }
        case "movement-cancelled": {

            if (gameState.temporalMovements.length === 0) {
                return gameState;
            }

            const newGameState = { ...gameState };

            const { movement, position, rotation } = gameState.temporalMovements[gameState.temporalMovements.length - 1];

            const newBoardState = {
                ...gameState.boardState,
                tiles: getTilesWithMovementDone(movement, position, rotation, gameState.boardState.tiles),
            };

            newGameState.boardState = newBoardState;
            newGameState.temporalMovements = gameState.temporalMovements.slice(0, gameState.temporalMovements.length - 1);

            if (gameState.currentRoundPlayer === gameState.selfPlayerState.roundOrder) {
                const selfPlayerState: SelfPlayerState = {
                    ...gameState.selfPlayerState,
                    movementCardsInHand: [...gameState.selfPlayerState.movementCardsInHand, movement],
                };

                newGameState.selfPlayerState = selfPlayerState;
            } else {
                newGameState.otherPlayersState = changeOtherPlayerState(
                    gameState.otherPlayersState,
                    p => p.roundOrder === gameState.currentRoundPlayer,
                    p => ({
                        ...p,
                        movementCardsInHandCount: p.movementCardsInHandCount + 1,
                    }),
                );
            }

            return newGameState;
        }
    }
}

function changeOtherPlayerState(
    players: readonly OtherPlayerState[],
    playerPredicate: (p: OtherPlayerState) => boolean,
    playerChanger: (p: OtherPlayerState) => OtherPlayerState,
): OtherPlayerState[] {
    return players.map(p => {
        if (playerPredicate(p)) {
            return playerChanger(p);
        } else {
            return p;
        }
    });
}

function getTilesWithMovementDone(movement: Movement, position: Position, rotation: Rotation, tiles: readonly Color[]): Color[] {
    const swp1 = positionToBoardIndex(position);
    const swp2 = positionToBoardIndex(getTargetFromPositionClamped(movement, rotation, position));

    return tiles.map((c, i) => {
        switch (i) {
            case swp1: return tiles[swp2];
            case swp2: return tiles[swp1];
            default: return c;
        }
    });
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
