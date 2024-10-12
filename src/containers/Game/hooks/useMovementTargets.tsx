import { useMemo } from "react";
import { getPossibleTargetsInBoard, Movement, MovementTarget } from "../../../domain/Movement";
import { Position } from "../../../domain/Position";

function useMovementTargets(movement: Movement | null, sourceTile: Position | null): MovementTarget[] {
    return useMemo(() => {
        if (movement == null || sourceTile == null) {
            return [];
        }

        return getPossibleTargetsInBoard(movement, sourceTile);
    }, [movement, sourceTile]);
}

export default useMovementTargets;