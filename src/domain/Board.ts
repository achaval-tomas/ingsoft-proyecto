import { Color } from "./Color";
import { Shape } from "./Shape";
import { boardIndexToPosition, positionToBoardIndex } from "./Position";
import { getShapeFromNormalizedShapeData, normalizeShapeData, ShapeData } from "./ShapeData";

export type BoardTileShapeData = {
    shape: Shape;
}

export function findConnectedTiles(boardTiles: readonly Color[], startIndex: number): ShapeData {
    const targetColor = boardTiles[startIndex];

    const visited: boolean[] = Array<boolean>(36).fill(false);
    const queue: number[] = [startIndex];
    const selected: number[] = [];

    while (queue.length !== 0) {
        const tileIndex = queue.shift()!;

        if (visited[tileIndex]) {
            continue;
        }
        visited[tileIndex] = true;

        const tileColor = boardTiles[tileIndex];

        if (tileColor !== targetColor) {
            continue;
        }
        selected.push(tileIndex);

        const [x, y] = boardIndexToPosition(tileIndex);

        if (x > 0) { queue.push(positionToBoardIndex([x - 1, y])); }
        if (x < 5) { queue.push(positionToBoardIndex([x + 1, y])); }
        if (y > 0) { queue.push(positionToBoardIndex([x, y - 1])); }
        if (y < 5) { queue.push(positionToBoardIndex([x, y + 1])); }
    }

    return selected.map(i => boardIndexToPosition(i));
}

export function findFormedShapes(boardTiles: readonly Color[]): (BoardTileShapeData | null)[] {
    const boardTilesData = Array<BoardTileShapeData | null | undefined>(36).fill(undefined);

    for (let tileIndex = 0; tileIndex < boardTilesData.length; tileIndex++) {
        const data = boardTilesData[tileIndex];
        if (data !== undefined) {
            continue;
        }

        const shapeCandidate = findConnectedTiles(boardTiles, tileIndex);
        const normalizedShapeCandidate = normalizeShapeData(shapeCandidate);
        const shapeWithDataOrNull = getShapeFromNormalizedShapeData(normalizedShapeCandidate) ?? null;

        for (const cell of shapeCandidate) {
            boardTilesData[positionToBoardIndex(cell)] = shapeWithDataOrNull && { shape: shapeWithDataOrNull.shape };
        }
    }

    // By now, all tiles should be visited, i.e, boardTilesData[i] !== undefined for all i.
    return boardTilesData as (BoardTileShapeData | null)[];
}
