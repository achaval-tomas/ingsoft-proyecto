import { z } from "zod";
import { Position } from "./Position";
import { Rotation, RotationSchema } from "./Rotation";

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

export type PossibleTargetsInBoard = {
    [key in Rotation]?: Position;
};

export function getPossibleTargetsInBoard(movement: Movement, position: Position): PossibleTargetsInBoard {
    const movementData = getMovementData(movement);

    const possibleTargets: PossibleTargetsInBoard = {};

    (Object.values(RotationSchema.enum)).forEach(r => {
        const [targetX, targetY] = getTarget(movement, r);

        if (movementData.clamps || (5 - position[0] >= targetX && position[0] >= -targetX
                                   && 5 - position[1] >= targetY && position[1] >= -targetY)) {
            const possibleTargetX = clamp(position[0] + targetX, 0, 5);
            const possibleTargetY = clamp(position[1] + targetY, 0, 5);

            if (possibleTargetX !== position[0] || possibleTargetY !== position[1]) {
                possibleTargets[r] = [possibleTargetX, possibleTargetY];
            }
        }
    });

    return possibleTargets;
}

export function getTarget(movement: Movement, rotation: Rotation): Position {
    const movementTarget = getMovementData(movement).target;

    switch (rotation) {
        case "r0":
            return [movementTarget[0], movementTarget[1]];
        case "r90":
            return [-movementTarget[1], movementTarget[0]];
        case "r180":
            return [-movementTarget[0], -movementTarget[1]];
        case "r270":
            return [movementTarget[1], -movementTarget[0]];
    }
}

export function getTargetFromPositionClamped(movement: Movement, rotation: Rotation, position: Position): Position {
    const target = getTarget(movement, rotation);

    return [clamp(position[0] + target[0], 0, 5), clamp(position[1] + target[1], 0, 5)];

}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(n, max));
}
