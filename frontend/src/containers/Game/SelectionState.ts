import { PlayerId } from "../../domain/GameState";

export type SelectionState = null | {
    type: "shape-card";
    playerId: PlayerId;
    shapeCardIndex: number;
} | {
    type: "movement-card";
    movementCardIndex: number;
} | {
    type: "movement-card-with-source-tile";
    movementCardIndex: number;
    sourceTileIndex: number;
}

export function getMovementCardIndexOrNull(selectionState: SelectionState): number | null {
    if (selectionState?.type !== "movement-card" && selectionState?.type !== "movement-card-with-source-tile") {
        return null;
    }

    return selectionState.movementCardIndex;
}

export function getSourceTileIndexOrNull(selectionState: SelectionState): number | null {
    if (selectionState?.type !== "movement-card-with-source-tile") {
        return null;
    }

    return selectionState.sourceTileIndex;
}