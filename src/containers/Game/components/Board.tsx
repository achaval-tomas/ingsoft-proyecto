import { Position } from "../../../domain/Position";
import { Color, colorToBackgroundClassName } from "../../../domain/Color";
import { boardIndexToPosition } from "../../../domain/Position";
import { BoardTileStatus, BoardUiState } from "../GameUiState";
import { CSSProperties } from "react";
import { Direction } from "../../../domain/Direction";

export type BoardTileData = {
    color: Color;
    isHighlighted: boolean;
}

export type BoardTileProps = {
    color: Color;
    status: BoardTileStatus;
    style: CSSProperties;
    onClick: () => void;
}

function BoardTile({ color, status, style, onClick }: BoardTileProps) {
    const parentDynamicClassNames = `${shadowByBoardTileStatus(status)} ${colorToBackgroundClassName(color)}`;
    const childDynamicClassNames = `${borderByBoardTileStatus(status)} ${animationByBoardTileStatus(status)}`;

    return (
        <div className={`rounded ${parentDynamicClassNames}`} onClick={onClick} style={style}>
            <div className={`w-full h-full rounded hover:border-white ${childDynamicClassNames}`}>
            </div>
        </div>
    );
}

function shadowByBoardTileStatus(status: BoardTileStatus): string {
    switch (status) {
        case "selected":
            return "shadow-[0_0_4px_1px_white,inset_0_0_5px_5px_white]";
        default:
            return "shadow-md shadow-black";
    }
}

function borderByBoardTileStatus(status: BoardTileStatus): string {
    switch (status) {
        case "selected":
            return "border-[4px] border-white";
        default:
            return "border border-transparent";
    }
}

function animationByBoardTileStatus(status: BoardTileStatus): string {
    switch (status) {
        case "selectable":
            return "animate-selectable";
        case "highlighted":
            return "animate-highlight";
        default:
            return "";
    }
}

type BoardProps = {
    uiState: BoardUiState;
    onClickTile: (i: Position) => void;
}

function Board({ uiState, onClickTile }: BoardProps) {
    const { tiles, activeSide } = uiState;

    return (
        <div
            className={`grid h-full aspect-square gap-[3%] p-[3%] bg-zinc-700 h-fit rounded-lg shadow-md shadow-black border-2 border-transparent ${borderColorFromActiveSide(activeSide)}`}
            style={{ grid: "repeat(6, 1fr) / repeat(6, 1fr)" }}
        >
            {tiles.map((t, i) => {
                const [x, y]: Position = boardIndexToPosition(i);

                return (
                    <BoardTile
                        key={i}
                        color={t.color}
                        status={t.status}
                        style={{ gridRowStart: 6 - y }}
                        onClick={() => onClickTile([x, y])}
                    />
                );
            })}
        </div>
    );
}

function borderColorFromActiveSide(activeSide: Direction): string {
    switch (activeSide) {
        case "r": return "border-r-primary-400";
        case "t": return "border-t-primary-400";
        case "l": return "border-l-primary-400";
        case "b": return "border-b-primary-400";
    }
}

export default Board;
