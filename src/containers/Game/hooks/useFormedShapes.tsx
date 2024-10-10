import { useMemo } from "react";
import { BoardState } from "../../../domain/GameState";
import { BoardTileShapeData, findFormedShapes } from "../../../domain/Board";
import { Shape } from "../../../domain/Shape";

function useFormedShapes(boardState: BoardState | null, shapeWhitelist: Shape[]): (BoardTileShapeData | null)[] | null {
    return useMemo(() => {
        if (boardState == null) {
            return null;
        }

        const formedShapes = findFormedShapes(boardState.tiles);
        const filteredFormedShapes = formedShapes.map(fs => {
            if (fs == null) {
                return null;
            }

            if (shapeWhitelist.find(s => s === fs.shape) === undefined) {
                return null;
            }

            return fs;
        });

        return filteredFormedShapes;
    }, [boardState, shapeWhitelist]);
}

export default useFormedShapes;