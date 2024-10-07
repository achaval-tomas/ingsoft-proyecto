import { describe, expect, test } from "vitest";
import { Color } from "./Color";
import { Position, positionToBoardIndex, sortPositions } from "./Position";
import { findConnectedTiles } from "./Board";

function toBoardTiles(data: string[]): Color[] {
    return data.toReversed().join("").split("").map<Color>(c => {
        switch (c) {
            case "r": return "red";
            case "g": return "green";
            case "b": return "blue";
            case "y": return "yellow";
            default: throw new Error(`invalid color char ${c}`);
        }
    });
}

const testBoardTiles: readonly Color[] = Object.freeze(toBoardTiles([
    "rgbyry",
    "rrrgbb",
    "gyybry",
    "ygbrrr",
    "yryryr",
    "rrrrrr",
]));

describe("findConnectedTiles", () => {
    function testSelection(startPosition: Position, expected: Position[]) {
        const connected = findConnectedTiles(testBoardTiles, positionToBoardIndex(startPosition));

        expect(sortPositions(connected)).toEqual(sortPositions(expected));
    }

    test("single cell A", () => {
        testSelection([1, 5], [[1, 5]]);
    });

    test("single cell B", () => {
        testSelection([0, 3], [[0, 3]]);
    });

    test("multiple cells A (corner top left)", () => {
        testSelection([0, 5], [[0, 5], [0, 4], [1, 4], [2, 4]]);
    });

    test("multiple cells B", () => {
        testSelection([2, 3], [[2, 3], [1, 3]]);
    });

    test("multiple cells C (includes corner bottom left & bottom right)", () => {
        const expected: Position[] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [1, 1], [3, 1], [5, 1], [3, 2], [4, 2], [5, 2], [4, 3]];
        testSelection([5, 1], expected);
        testSelection([0, 0], expected);
        testSelection([3, 0], expected);
        testSelection([4, 3], expected);
        testSelection([5, 0], expected);
    });

    test("corner top right", () => {
        testSelection([5, 5], [[5, 5]]);
    });
});