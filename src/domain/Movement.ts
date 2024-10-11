import { z } from "zod";
import { Position, positionAdd, positionRotate, positionsEqual } from "./Position";
import { allRotations, Rotation } from "./Rotation";

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

export function getPossibleTargetsInBoard(movement: Movement, source: Position): PossibleTargetsInBoard {
    const movementData = getMovementData(movement);

    const possibleTargets: PossibleTargetsInBoard = {};

    for (const r of allRotations) {
        const offset = positionRotate(movementData.target, r);
        const target = positionAdd(source, offset);

        if (movementData.clamps) {
            target[0] = clamp(target[0], 0, 5);
            target[1] = clamp(target[1], 0, 5);
        } else if (target[0] < 0 || target[0] > 5 || target[1] < 0 || target[1] > 5) {
            continue;
        }

        if (positionsEqual(source, target)) {
            continue;
        }

        possibleTargets[r] = target;
    }

    return possibleTargets;
}

export function getRotatedTarget(movement: Movement, rotation: Rotation): Position {
    return positionRotate(getMovementData(movement).target, rotation);
}

export function getTargetFromPositionClamped(movement: Movement, rotation: Rotation, position: Position): Position {
    const target = getRotatedTarget(movement, rotation);

    return [clamp(position[0] + target[0], 0, 5), clamp(position[1] + target[1], 0, 5)];

}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(n, max));
}
