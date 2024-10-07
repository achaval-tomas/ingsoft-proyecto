import { Position, positionsEqual } from "../../../domain/Position";
import { Color, colorToBackgroundClassName } from "../../../domain/Color";
import { boardIndexToPosition } from "../../../domain/Position";

export type BoardTileData = {
    color: Color;
    isHighlighted: boolean;
}

export type BoardTileProps = {
    rowStart: number;
    color: Color;
    selected: boolean;
    selectable: boolean;
    isHighlighted: boolean;
    onClick: () => void;
}

function BoardTile({ rowStart, color, isHighlighted, selected, selectable, onClick }: BoardTileProps) {
    const highlightClassName = isHighlighted ? "animate-highlight" : "";
    const shadowClassName = isHighlighted ? "shadow-md shadow-black" : "shadow-md shadow-black";

    const borderStyle = selected ? { boxShadow: "0 0 2px 4px white" } : (selectable ? { boxShadow: "0 0 2px 4px lightgreen" } : {});

    return (
        <div className={`${colorToBackgroundClassName(color)} ${shadowClassName} rounded`} onClick={onClick} style={{ gridRowStart: rowStart }}>
            <div className={`w-full h-full rounded border border-transparent hover:border-white ${highlightClassName}`} style={borderStyle}>
            </div>
        </div>
    );
}

type BoardProps = {
    tiles: BoardTileData[]; // length must be 36
    activeSide: "b" | "r" | "t" | "l";
    selectedTile: Position | null;
    selectableTiles: Position[];
    onClickTile: (i: Position) => void;
}

function borderColorFromActiveSide(activeSide: "b" | "r" | "t" | "l"): string {
    switch (activeSide) {
        case "b": return "border-b-primary-400";
        case "r": return "border-r-primary-400";
        case "t": return "border-t-primary-400";
        case "l": return "border-l-primary-400";
    }
}

function Board({ tiles, activeSide, selectedTile, selectableTiles, onClickTile }: BoardProps) {
    const boardTiles = tiles.map((t, i) => {
        const coords: Position = boardIndexToPosition(i);

        return (
            <BoardTile
                rowStart={6 - coords[1]}
                key={i}
                color={t.color}
                isHighlighted={t.isHighlighted}
                selected={selectedTile != null && positionsEqual(selectedTile, coords)}
                selectable={selectableTiles.some(e => positionsEqual(e, coords))}
                onClick={() => onClickTile(coords)}
            />
        );
    });
    return (
        <div
            className={`grid h-full aspect-square gap-[3%] p-[3%] bg-zinc-700 h-fit rounded-lg shadow-md shadow-black border border-transparent ${borderColorFromActiveSide(activeSide)}`}
            style={{ grid: "repeat(6, 1fr) / repeat(6, 1fr)" }}
        >
            {boardTiles}
        </div>
    );
}

export default Board;
