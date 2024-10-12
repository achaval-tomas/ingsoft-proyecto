import { useMemo } from "react";
import { getPossibleTargetsInBoard, MovementTarget } from "../../../domain/Movement";
import { SelectionState } from "../SelectionState";
import { GameState } from "../../../domain/GameState";
import { boardIndexToPosition } from "../../../domain/Position";

function useMovementTargets(gameState: GameState, selectionState: SelectionState): MovementTarget[] {
    return useMemo(() => {
        if (selectionState?.type !== "movement-card-with-source-tile") {
            return [];
        }

        const movement = gameState.selfPlayerState.movementCardsInHand[selectionState.movementCardIndex];
        const sourceTilePosition = boardIndexToPosition(selectionState.sourceTileIndex);

        return getPossibleTargetsInBoard(movement, sourceTilePosition);
    }, [gameState.selfPlayerState.movementCardsInHand, selectionState]);
}

export default useMovementTargets;