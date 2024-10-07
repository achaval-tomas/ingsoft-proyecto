import { describe, expect, test } from "vitest";
import { Color } from "./Color";
import { Position, positionToBoardIndex, sortPositions } from "./Position";
import { BoardTileShapeData, findConnectedTiles, findFormedShapes } from "./Board";

function reverseFlattenRowArray<T>(rows: T[][]): T[] {
    return rows.toReversed().flat();
}

function toBoardTiles(rows: string[]): Color[] {
    return reverseFlattenRowArray(rows.map(w => w.split(""))).map<Color>(c => {
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

const testBoardTiles2: readonly Color[] = Object.freeze(toBoardTiles([
    "rgbbyy",
    "rrrryy",
    "gyybbg",
    "yybggg",
    "ggyryb",
    "gggrrr",
]));

describe("findFormedShapes", () => {
    test("works correctly with same board as findConnectedTiles", () => {
        const formedShapesData = findFormedShapes(testBoardTiles);
        const expected: (BoardTileShapeData | null)[] = reverseFlattenRowArray([
            [{ shape: "b-4" }, null, null, null, null, null],
            [{ shape: "b-4" }, { shape: "b-4" }, { shape: "b-4" }, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
        ]);

        expect(formedShapesData).toEqual(expected);
    });

    test("works correctly with testBoardTiles2", () => {
        const formedShapesData = findFormedShapes(testBoardTiles2);
        const expected: (BoardTileShapeData | null)[] = reverseFlattenRowArray<(BoardTileShapeData | null)>([
            [{ shape: "c-6" }, null, null, null, { shape: "b-1" }, { shape: "b-1" }],
            [{ shape: "c-6" }, { shape: "c-6" }, { shape: "c-6" }, { shape: "c-6" }, { shape: "b-1" }, { shape: "b-1" }],
            [null, { shape: "b-0" }, { shape: "b-0" }, null, null, { shape: "b-6" }],
            [{ shape: "b-0" }, { shape: "b-0" }, null, { shape: "b-6" }, { shape: "b-6" }, { shape: "b-6" }],
            [{ shape: "c-17" }, { shape: "c-17" }, null, { shape: "b-4" }, null, null],
            [{ shape: "c-17" }, { shape: "c-17" }, { shape: "c-17" }, { shape: "b-4" }, { shape: "b-4" }, { shape: "b-4" }],
        ]);

        expect(formedShapesData).toEqual(expected);
    });
});