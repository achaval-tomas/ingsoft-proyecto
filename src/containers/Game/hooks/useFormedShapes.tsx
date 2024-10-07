import { useMemo } from "react";
import { BoardState } from "../../../domain/GameState";
import { BoardTileShapeData, findFormedShapes } from "../../../domain/Board";

function useFormedShapes(boardState: BoardState | null): (BoardTileShapeData | null)[] | null {
    return useMemo(() => boardState && findFormedShapes(boardState.tiles), [boardState]);
}

export default useFormedShapes;