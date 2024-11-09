import { describe, expect, test } from "vitest";
import { getPossibleTargetsInBoard, Movement, MovementTarget, sortMovementTargets } from "./Movement";
import { Position } from "./Position";

describe("getPossibleTargetsInBoard", () => {
    function testSelection(movement: Movement, source: Position, expectedTargets: MovementTarget[]) {
        expect(sortMovementTargets(getPossibleTargetsInBoard(movement, source)))
            .toEqual(sortMovementTargets(expectedTargets));
    }

    test("straight adjacent on middle of board", () => {
        testSelection("straight-adjacent", [2, 2], [
            {
                movementRotation: "r0",
                position: [3, 2],
            },
            {
                movementRotation: "r90",
                position: [2, 3],
            },
            {
                movementRotation: "r180",
                position: [1, 2],
            },
            {
                movementRotation: "r270",
                position: [2, 1],
            },
        ]);
    });

    test("straight adjacent on upper left corner of board", () => {
        testSelection("straight-adjacent", [0, 5], [
            {
                movementRotation: "r0",
                position: [1, 5],
            },
            {
                movementRotation: "r270",
                position: [0, 4],
            },
        ]);
    });

    test("straight edge on middle of board", () => {
        testSelection("straight-edge", [3, 3], [
            {
                movementRotation: "r0",
                position: [5, 3],
            },
            {
                movementRotation: "r90",
                position: [3, 5],
            },
            {
                movementRotation: "r180",
                position: [0, 3],
            },
            {
                movementRotation: "r270",
                position: [3, 0],
            },
        ]);
    });

    test("straight edge on edge of board", () => {
        testSelection("straight-edge", [3, 5], [
            {
                movementRotation: "r0",
                position: [5, 5],
            },
            {
                movementRotation: "r180",
                position: [0, 5],
            },
            {
                movementRotation: "r270",
                position: [3, 0],
            },
        ]);
    });

    test("straight edge on lower right corner of board", () => {
        testSelection("straight-edge", [5, 0], [
            {
                movementRotation: "r90",
                position: [5, 5],
            },
            {
                movementRotation: "r180",
                position: [0, 0],
            },
        ]);
    });

    test("diagonal adjacent on middle of board", () => {
        testSelection("diagonal-adjacent", [4, 4], [
            {
                movementRotation: "r0",
                position: [5, 5],
            },
            {
                movementRotation: "r90",
                position: [3, 5],
            },
            {
                movementRotation: "r180",
                position: [3, 3],
            },
            {
                movementRotation: "r270",
                position: [5, 3],
            },
        ]);
    });

    test("diagonal spaced on middle of board", () => {
        testSelection("diagonal-spaced", [2, 2], [
            {
                movementRotation: "r0",
                position: [4, 4],
            },
            {
                movementRotation: "r90",
                position: [0, 4],
            },
            {
                movementRotation: "r180",
                position: [0, 0],
            },
            {
                movementRotation: "r270",
                position: [4, 0],
            },
        ]);
    });

    test("l counter clockwise on middle of board", () => {
        testSelection("l-ccw", [2, 2], [
            {
                movementRotation: "r0",
                position: [4, 3],
            },
            {
                movementRotation: "r90",
                position: [1, 4],
            },
            {
                movementRotation: "r180",
                position: [0, 1],
            },
            {
                movementRotation: "r270",
                position: [3, 0],
            },
        ]);
    });

    test("l clockwise on middle of board", () => {
        testSelection("l-cw", [2, 2], [
            {
                movementRotation: "r0",
                position: [3, 4],
            },
            {
                movementRotation: "r90",
                position: [0, 3],
            },
            {
                movementRotation: "r180",
                position: [1, 0],
            },
            {
                movementRotation: "r270",
                position: [4, 1],
            },
        ]);
    });

    test("straight spaced on middle of board", () => {
        testSelection("straight-spaced", [3, 3], [
            {
                movementRotation: "r0",
                position: [5, 3],
            },
            {
                movementRotation: "r90",
                position: [3, 5],
            },
            {
                movementRotation: "r180",
                position: [1, 3],
            },
            {
                movementRotation: "r270",
                position: [3, 1],
            },
        ]);
    });
});
