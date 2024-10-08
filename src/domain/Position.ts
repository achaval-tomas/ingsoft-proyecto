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
