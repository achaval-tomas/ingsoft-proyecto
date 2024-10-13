import { useMemo } from "react";
import { BoardState } from "../../../domain/GameState";
import { BoardTileShapeData, findFormedShapes } from "../../../domain/Board";
import { BoardTileStatus, BoardTileUiState, BoardUiState } from "../GameUiState";
import { Direction } from "../../../domain/Direction";
import { positionToBoardIndex } from "../../../domain/Position";
import { Shape } from "../../../domain/Shape";
import { MovementTarget } from "../../../domain/Movement";

function useBoardUiState(
    boardState: BoardState,
    shapeWhitelist: Shape[],
    currentTurnPlayerIndex: number,
    selectedTileIndex: number | null,
    movementTargets: MovementTarget[],
): BoardUiState {
    const tiles = useMemo<BoardTileUiState[]>(() => {
        const formedShapes = findFormedShapes(boardState.tiles);

        const filteredFormedShapes = formedShapes.map(tileData => {
            if (tileData == null) {
                return null;
            }

            if (shapeWhitelist.find(s => s === tileData.shape) === undefined) {
                return null;
            }

            return tileData;
        });

        return boardState.tiles.map((color, i) => ({
            color,
            status: computeBoardTileStatus(i, selectedTileIndex, filteredFormedShapes, movementTargets),
        }));;
    }, [boardState, shapeWhitelist, selectedTileIndex, movementTargets]);

    const boardUiState = useMemo<BoardUiState>(
        () => ({
            tiles,
            activeSide: playerIndexToDirection(currentTurnPlayerIndex),
            blockedColor: boardState.blockedColor,
        }),
        [tiles, currentTurnPlayerIndex, boardState.blockedColor],
    );

    return boardUiState;
}

function computeBoardTileStatus(
    tileIndex: number,
    selectedTileIndex: number | null,
    formedShapes: (BoardTileShapeData | null)[],
    movementTargets: MovementTarget[],
): BoardTileStatus {
    if (selectedTileIndex != null) {
        if (tileIndex === selectedTileIndex) {
            return "selected";
        } else if (movementTargets.find(mt => positionToBoardIndex(mt.position) === tileIndex) != null) {
            return "selectable";
        } else {
            return "normal";
        }
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