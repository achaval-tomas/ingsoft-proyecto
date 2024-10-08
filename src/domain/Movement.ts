import { z } from "zod";
import { Position } from "./Position";

export const MovementSchema = z.enum([
    "straight-adjacent",
    "straight-spaced",
    "straight-edge",
    "diagonal-adjacent",
    "diagonal-spaced",
    "l-ccw",
    "l-cw",
]);


export type Movement = z.infer<typeof MovementSchema>;

export type MovementData = {
    clamps: boolean;
    target: Position;
};

export function getMovementData(movement: Movement): MovementData {
    switch (movement) {
        case "straight-adjacent":
            return { clamps: false, target: [1, 0] };
        case "straight-spaced":
            return { clamps: false, target: [2, 0] };
        case "straight-edge":
            return { clamps: true, target: [5, 0] };
        case "diagonal-adjacent":
            return { clamps: false, target: [1, 1] };
        case "diagonal-spaced":
            return { clamps: false, target: [2, 2] };
        case "l-ccw":
            return { clamps: false, target: [2, 1] };
        case "l-cw":
            return { clamps: false, target: [1, 2] };
    }
}

type Rotation = "r0" | "r90" | "r180" | "r270";

export type PossibleTargetsInBoard = {
    [key in Rotation]?: Position;
};

export function getPossibleTargetsInBoard(movement: Movement, position: Position): PossibleTargetsInBoard {
    const movementData = getMovementData(movement);
    const targetX = movementData.target[0];
    const targetY = movementData.target[1];

    const possibleTargets: PossibleTargetsInBoard = {};

    const rotations: {[key in Rotation]: [number, number]} = {
        "r0": [targetX, targetY],
        "r90": [-targetY, targetX],
        "r180": [-targetX, -targetY],
        "r270": [targetY, -targetX],
    };

    (Object.keys(rotations) as Rotation[]).forEach(r => {
        const [targetX, targetY] = rotations[r];

        if (movementData.clamps || (5 - position[0] >= targetX && position[0] >= -targetX
                                   && 5 - position[1] >= targetY && position[1] >= -targetY)) {
            const possibleTargetX = Math.max(0, Math.min(position[0] + targetX, 5));
            const possibleTargetY = Math.max(0, Math.min(position[1] + targetY, 5));

            if (possibleTargetX !== position[0] || possibleTargetY !== position[1]) {
                possibleTargets[r] = [possibleTargetX, possibleTargetY];
            }
        }
    });

    return possibleTargets;
}
