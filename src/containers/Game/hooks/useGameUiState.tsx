import { useMemo } from "react";
import { CommonPlayerState, GameState } from "../../../domain/GameState";
import { CommonPlayerUiState, GameUiState, OtherPlayerUiState, SelfPlayerUiState } from "../GameUiState";
import useBoardUiState from "./useBoardUiState";
import { Position } from "../../../domain/Position";
import useWinner from "./useWinner";
import { MovementTarget } from "../../../domain/Movement";

function useGameUiState(
    gameState: GameState,
    selectedMovementCard: number | null,
    selectedTile: Position | null,
    movementTargets: MovementTarget[],
): GameUiState {
    const { selfPlayerState, otherPlayersState, boardState, currentRoundPlayer, temporalMovements } = gameState;

    const selfPlayerUiState = useMemo<SelfPlayerUiState>(
        () => ({
            ...commonPlayerStateToUiState(selfPlayerState),
            movementCardsInHand: selfPlayerState.movementCardsInHand.map(
                (m, i) => ({
                    movement: m,
                    status: (i === selectedMovementCard) ? "selected" : "normal",
                }),
            ),
            canCancelMovement: currentRoundPlayer === selfPlayerState.roundOrder && temporalMovements.length > 0,
        }),
        [selfPlayerState, selectedMovementCard, currentRoundPlayer, temporalMovements],
    );

    const otherPlayersUiState = useMemo<OtherPlayerUiState[]>(
        () => otherPlayersState.map<OtherPlayerUiState>(otherPlayerState => ({
            ...commonPlayerStateToUiState(otherPlayerState),
            movementCardsInHandCount: otherPlayerState.movementCardsInHandCount,
        })),
        [otherPlayersState],
    );

    const shapeWhitelist = useMemo(
        () => selfPlayerState.shapeCardsInHand
            .concat(otherPlayersState.map(p => p.shapeCardsInHand).flat())
            .map(s => s.shape),
        [selfPlayerState, otherPlayersState],
    );

    const currentTurnPlayerIndex = [gameState.selfPlayerState, ...gameState.otherPlayersState]
        .findIndex(p => p.roundOrder === gameState.currentRoundPlayer);

    const boardUiState = useBoardUiState(
        boardState,
        shapeWhitelist,
        currentTurnPlayerIndex,
        selectedTile,
        movementTargets,
    );

    const winner = useWinner(gameState);
    const winnerName = winner?.name;

    const uiState = useMemo<GameUiState>(
        () => ({
            selfPlayerUiState,
            otherPlayersUiState,
            boardUiState,
            winnerName,
        }),
        [selfPlayerUiState, otherPlayersUiState, boardUiState, winnerName],
    );

    return uiState;
}

function commonPlayerStateToUiState(state: CommonPlayerState): CommonPlayerUiState {
    return {
        name: state.name,
        shapeCardsInHand: state.shapeCardsInHand.map(sc => ({
            shape: sc.shape,
            status: sc.isBlocked ? "blocked" : "normal",
        })),
        shapeCardsInDeckCount: state.shapeCardsInDeckCount,
    };
}

export default useGameUiState;
