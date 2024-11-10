import AppState, { clockSyncOffsetInMillis } from "../domain/AppState";
import { Color } from "../domain/Color";
import { BoardState, GameState, GameStatePatch, getAllPlayers, OtherPlayerState, SelfPlayerState } from "../domain/GameState";
import { getTargetFromPositionClamped, Movement } from "../domain/Movement";
import { Position, positionToBoardIndex } from "../domain/Position";
import { Rotation } from "../domain/Rotation";
import { getShapeAtOrNull } from "../domain/Board";
import Action from "./Action";
import { GameMessageIn } from "../domain/GameMessage";
import Notification from "../domain/Notification";
import ChatMessage from "../domain/ChatMessage";

let nextNotificationId: number = 0;

function computeNextPlayer(s: GameState): number {
    const allPlayers = getAllPlayers(s).toSorted((lhs, rhs) => lhs.roundOrder - rhs.roundOrder);
    const nextPlayer = allPlayers.find(p => p.roundOrder > s.currentRoundPlayer) ?? allPlayers[0];

    return nextPlayer.roundOrder;
}

function serverNowAsIsoString(): string {
    return (new Date(Date.now() - clockSyncOffsetInMillis.value)).toISOString();
}

function gameStateReducer(gameState: GameState | null, action: GameMessageIn): GameState | null {
    if (action.type === "game-state") {
        clockSyncOffsetInMillis.value = (new Date()).getTime() - (new Date(action.now)).getTime();
        return action.gameState;
    }

    if (gameState == null) {
        return gameState;
    }

    switch (action.type) {
        case "turn-ended": {
            const newGameState = { ...gameState };

            if (action.playerId === gameState.selfPlayerState.id) {
                const newSelfPlayerState = { ...gameState.selfPlayerState };

                newSelfPlayerState.shapeCardsInDeckCount -= action.newShapeCards.length - newSelfPlayerState.shapeCardsInHand.length;
                newSelfPlayerState.shapeCardsInHand = action.newShapeCards;
                newSelfPlayerState.movementCardsInHand = action.newMovementCards ?? [];

                newGameState.selfPlayerState = newSelfPlayerState;
            } else {
                newGameState.otherPlayersState = changeOtherPlayerState(
                    gameState.otherPlayersState,
                    p => p.id === action.playerId,
                    p => ({
                        ...p,
                        shapeCardsInDeckCount: p.shapeCardsInDeckCount - (action.newShapeCards.length - p.shapeCardsInHand.length),
                        shapeCardsInHand: action.newShapeCards,
                        movementCardsInHandCount: 3,
                    }),
                );
            }

            newGameState.currentRoundPlayer = computeNextPlayer(newGameState);
            newGameState.turnStart = serverNowAsIsoString();

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
                newGameState.turnStart = serverNowAsIsoString();
            }

            return newGameState;
        }
        case "movement-card-used": {
            const { movement, position, rotation } = action;

            const newSelfPlayerState: SelfPlayerState = { ...gameState.selfPlayerState };

            if (gameState.currentRoundPlayer === gameState.selfPlayerState.roundOrder) {
                newSelfPlayerState.movementCardsInHand = filterFirst(
                    gameState.selfPlayerState.movementCardsInHand,
                    m => m === movement,
                );
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
        case "shape-card-used": {
            const { position, targetPlayerId } = action;

            const tileIndex = positionToBoardIndex(position);

            const shapeAtPosition = getShapeAtOrNull(gameState.boardState.tiles, position);
            if (shapeAtPosition == null) {
                return gameState;
            }

            const shapeColor = gameState.boardState.tiles[tileIndex];
            if (shapeColor === gameState.boardState.blockedColor) {
                return gameState;
            }

            const newBoardState: BoardState = {
                ...gameState.boardState,
                blockedColor: shapeColor,
            };

            const updateShapeCardsPatch: GameStatePatch = (targetPlayerId === gameState.selfPlayerState.id)
                ? {
                    selfPlayerState: {
                        ...gameState.selfPlayerState,
                        // If it is us who is using the shape card (on ourselves), then discard the card.
                        // Otherwise, block the target's shape card.
                        shapeCardsInHand: (gameState.selfPlayerState.roundOrder === gameState.currentRoundPlayer)
                            ? filterFirst(
                                gameState.selfPlayerState.shapeCardsInHand,
                                sc => sc.shape === shapeAtPosition,
                            )
                            : mapFirst(
                                gameState.selfPlayerState.shapeCardsInHand,
                                sc => sc.shape === shapeAtPosition,
                                sc => ({ ...sc, isBlocked: true }),
                            ),
                    },
                }
                : {
                    otherPlayersState: gameState.otherPlayersState.map(otherPlayerState => {
                        if (otherPlayerState.id !== targetPlayerId) {
                            return otherPlayerState;
                        }

                        return {
                            ...otherPlayerState,
                            // If the target player is the source player, then discard the card.
                            // Otherwise, block the target's shape card.
                            shapeCardsInHand: (otherPlayerState.roundOrder === gameState.currentRoundPlayer)
                                ? filterFirst(
                                    otherPlayerState.shapeCardsInHand,
                                    sc => sc.shape === shapeAtPosition,
                                )
                                : mapFirst(
                                    otherPlayerState.shapeCardsInHand,
                                    sc => sc.shape === shapeAtPosition,
                                    sc => ({ ...sc, isBlocked: true }),
                                ),
                        };
                    }),
                };

            const newGameState: GameState = {
                ...gameState,
                boardState: newBoardState,
                temporalMovements: [],
                ...updateShapeCardsPatch,
            };

            return newGameState;
        }
        case "new-message": {
            return gameState;
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

function filterFirst<T>(arr: readonly T[], p: (t: T) => boolean): T[] {
    const firstIndex = arr.findIndex(a => p(a));
    return arr.filter((_, i) => i !== firstIndex);
}

function createSystemMessage(text: string): ChatMessage {
    return {
        type: "system-message",
        text: text,
    };
};

function mapFirst<T>(arr: readonly T[], p: (t: T) => boolean, f: (t: T) => T): T[] {
    const firstIndex = arr.findIndex(a => p(a));
    return arr.map((e, i) => (i === firstIndex) ? f(e) : e);
}

function chatMessagesReducer(gameState: GameState | null, chatMessages: ChatMessage[], action: Action): ChatMessage[] {
    if (gameState == null) {
        return chatMessages;
    }

    const currentPlayer = getAllPlayers(gameState).find(p => p.roundOrder === gameState.currentRoundPlayer);
    if (currentPlayer == null) {
        return chatMessages;
    }

    let newChatMessage: string;
    switch (action.type) {
        case "movement-card-used": {
            newChatMessage = `${currentPlayer.name} hizo un movimiento.`;
            break;
        }
        case "movement-cancelled": {
            newChatMessage = `${currentPlayer.name} canceló un movimiento.`;
            break;
        }
        case "shape-card-used": {
            newChatMessage = `${currentPlayer.name} descartó una carta de figura.`;
            break;
        }
        case "player-left": {
            newChatMessage = `${currentPlayer.name} abandonó la partida.`;
            break;
        }
        case "turn-ended": {
            const nextPlayer = getAllPlayers(gameState).find(p => p.roundOrder === computeNextPlayer(gameState));
            if (nextPlayer == null) {
                return chatMessages;
            }

            newChatMessage = `Terminó el turno de ${currentPlayer.name}, ahora es el turno de ${nextPlayer.name}.`;
            break;
        }
        default: {
            return chatMessages;
        }
    }

    return chatMessages.concat(createSystemMessage(newChatMessage));
}

function rootReducer(state: AppState | undefined, action: Action): AppState {
    if (state == null) { // we provide an initial value for state, so it should never be null.
        throw new Error(`store state is ${state}`);
    }

    if (action.type === "clear-notification") {
        return { ...state, notifications: state.notifications.filter(n => n.id !== action.notificationId) };
    }

    if (action.type === "create-notification") {
        const newNotification: Notification = {
            id: nextNotificationId,
            type: action.notificationType,
            message: action.message,
            timeoutMillis: action.timeoutMillis,
        };

        nextNotificationId++;

        return {
            ...state,
            notifications: state.notifications.concat(newNotification),
        };
    }

    if (action.type === "clear-game-state") {
        return { ...state, gameState: null };
    }

    if (action.type === "new-message") {
        return { ...state, chatMessages: state.chatMessages.concat(action.message) };
    }

    return {
        ...state,
        gameState: gameStateReducer(state.gameState, action),
        chatMessages: chatMessagesReducer(state.gameState, state.chatMessages, action),
    };
}

export default rootReducer;
