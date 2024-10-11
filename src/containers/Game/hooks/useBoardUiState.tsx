import { useMemo } from "react";
import { BoardState } from "../../../domain/GameState";
import { BoardTileShapeData, findFormedShapes } from "../../../domain/Board";
import { BoardTileStatus, BoardTileUiState, BoardUiState } from "../GameUiState";
import { Direction } from "../../../domain/Direction";
import { Position, positionToBoardIndex } from "../../../domain/Position";

function useBoardUiState(boardState: BoardState, selectedTile: Position | null): BoardUiState {
    const selectedTileIndex = (selectedTile != null) ? positionToBoardIndex(selectedTile) : null;

    const tiles = useMemo<BoardTileUiState[]>(() => {
        const formedShapes = findFormedShapes(boardState.tiles);

        return boardState.tiles.map((color, i) => ({
            color,
            status: computeBoardTileStatus(i, selectedTileIndex, formedShapes),
        }));;
    }, [boardState, selectedTileIndex]);

    const currentTurnPlayerIndex = 2;

    const boardUiState = useMemo<BoardUiState>(
        () => ({
            tiles,
            activeSide: playerIndexToDirection(currentTurnPlayerIndex),
        }),
        [tiles, currentTurnPlayerIndex],
    );

    return boardUiState;
}

function computeBoardTileStatus(
    tileIndex: number,
    selectedTileIndex: number | null,
    formedShapes: (BoardTileShapeData | null)[],
): BoardTileStatus {
    if (selectedTileIndex != null) {
        return (tileIndex === selectedTileIndex) ? "selected" : "normal";
    } else {
        return (formedShapes[tileIndex] != null) ? "highlighted" : "normal";
    }
}

function playerIndexToDirection(index: number): Direction {
    switch (index) {
        case 0: return "b";
        case 1: return "r";
        case 2: return "t";
        case 3: return "l";
        default: return "b";
    }
}

export default useBoardUiState;