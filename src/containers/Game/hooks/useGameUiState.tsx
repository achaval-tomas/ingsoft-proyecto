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

    const selfPlayerUiState = useMemo<SelfPlayerUiState>(
        () => ({
            ...commonPlayerStateToUiState(selfPlayerState, selectionState),
            movementCardsInHand: selfPlayerState.movementCardsInHand.map(
                (m, i) => ({
                    movement: m,
                    status: (i === getMovementCardIndexOrNull(selectionState)) ? "selected" : "normal",
                }),
            ),
            canCancelMovement: currentRoundPlayer === selfPlayerState.roundOrder && temporalMovements.length > 0,
        }),
        [selfPlayerState, selectionState, currentRoundPlayer, temporalMovements],
    );

    const otherPlayersUiState = useMemo<OtherPlayerUiState[]>(
        () => otherPlayersState.map<OtherPlayerUiState>(otherPlayerState => ({
            ...commonPlayerStateToUiState(otherPlayerState, selectionState),
            movementCardsInHandCount: otherPlayerState.movementCardsInHandCount,
        })),
        [otherPlayersState, selectionState],
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
        getSourceTileIndexOrNull(selectionState),
        movementTargets,
    );

    const turnStart = gameState.turnStart;

    const winner = useWinner(gameState);
    const winnerName = winner?.name;

    const uiState = useMemo<GameUiState>(
        () => ({
            selfPlayerUiState,
            otherPlayersUiState,
            boardUiState,
            turnStart,
            winnerName,
        }),
        [selfPlayerUiState, otherPlayersUiState, boardUiState, turnStart, winnerName],
    );

    return uiState;
}

function commonPlayerStateToUiState(state: CommonPlayerState, selectionState: SelectionState): CommonPlayerUiState {
    const selectedShapeCardIndex = (selectionState?.type === "shape-card" && selectionState.playerId === state.id)
        ? selectionState.shapeCardIndex
        : null;

    return {
        id: state.id,
        name: state.name,
        shapeCardsInHand: state.shapeCardsInHand.map((sc, i) => ({
            shape: sc.shape,
            status: (i === selectedShapeCardIndex)
                ? "selected"
                : sc.isBlocked && state.shapeCardsInHand.length > 1
                    ? "blocked"
                    : "normal",
        })),
        shapeCardsInDeckCount: state.shapeCardsInDeckCount,
    };
}

export default useGameUiState;
