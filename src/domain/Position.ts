import { Rotation } from "./Rotation";

export type Position = [number, number];

export function sortPositions(positions: readonly Position[]): Position[] {
    return positions.toSorted((lhs, rhs) => positionToBoardIndex(lhs) - positionToBoardIndex(rhs));
}

export function positionToBoardIndex([x, y]: readonly [number, number]): number {
    return x + y * 6;
}

export function boardIndexToPosition(index: number): Position {
    return [index % 6, Math.floor(index / 6)];
}

export function positionsEqual(a: Position, b: Position): boolean {
    return a[0] === b[0] && a[1] === b[1];
};

export function rotatePositions90(positions: readonly Position[]): Position[] {
    return positions.map(([x, y]) => [-y, x]);
}

export function rotatePositions(positions: readonly Position[], rotation: Rotation): Position[] {
    switch (rotation) {
        case "r0": return positions.slice();
        case "r90": return positions.map(([x, y]) => [-y, x]);
        case "r180": return positions.map(([x, y]) => [-x, -y]);
        case "r270": return positions.map(([x, y]) => [y, -x]);
    }
}
