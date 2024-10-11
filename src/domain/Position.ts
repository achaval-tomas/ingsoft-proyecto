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

export function positionAdd([lhsX, lhsY]: Position, [rhsX, rhsY]: Position): Position {
    return [lhsX + rhsX, lhsY + rhsY];
}

function positionRotate0([x, y]: Position): Position { return [x, y]; }
function positionRotate90([x, y]: Position): Position { return [-y, x]; }
function positionRotate180([x, y]: Position): Position { return [-x, -y]; }
function positionRotate270([x, y]: Position): Position { return [y, -x]; }

export function positionRotate(position: Position, rotation: Rotation): Position {
    switch (rotation) {
        case "r0": return positionRotate0(position);
        case "r90": return positionRotate90(position);
        case "r180": return positionRotate180(position);
        case "r270": return positionRotate270(position);
    }
}

export function rotatePositions(positions: readonly Position[], rotation: Rotation): Position[] {
    switch (rotation) {
        case "r0": return positions.map(positionRotate0);
        case "r90": return positions.map(positionRotate90);
        case "r180": return positions.map(positionRotate180);
        case "r270": return positions.map(positionRotate270);
    }
}
