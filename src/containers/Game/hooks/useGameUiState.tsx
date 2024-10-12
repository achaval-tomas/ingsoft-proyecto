import { useMemo } from "react";
import { CommonPlayerState, GameState } from "../../../domain/GameState";
import { CommonPlayerUiState, GameUiState, OtherPlayerUiState, SelfPlayerUiState } from "../GameUiState";
import useBoardUiState from "./useBoardUiState";
import useWinner from "./useWinner";
import { MovementTarget } from "../../../domain/Movement";
import { getMovementCardIndexOrNull, getSourceTileIndexOrNull, SelectionState } from "../SelectionState";

function useGameUiState(
    gameState: GameState,
    selectionState: SelectionState,
    movementTargets: MovementTarget[],
): GameUiState {
    const { selfPlayerState, otherPlayersState, boardState, currentRoundPlayer, temporalMovements } = gameState;

    const selectedMovementCardIndexOrNull = getMovementCardIndexOrNull(selectionState);
    const selectedSourceTileIndexOrNull = getSourceTileIndexOrNull(selectionState);

    const selfPlayerUiState = useMemo<SelfPlayerUiState>(
        () => ({
            ...commonPlayerStateToUiState(selfPlayerState),
            movementCardsInHand: selfPlayerState.movementCardsInHand.map(
                (m, i) => ({
                    movement: m,
                    status: (i === selectedMovementCardIndexOrNull) ? "selected" : "normal",
                }),
            ),
            canCancelMovement: currentRoundPlayer === selfPlayerState.roundOrder && temporalMovements.length > 0,
        }),
        [selfPlayerState, selectedMovementCardIndexOrNull, currentRoundPlayer, temporalMovements],
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
        selectedSourceTileIndexOrNull,
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
