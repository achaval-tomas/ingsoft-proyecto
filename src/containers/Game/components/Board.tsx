import { Color, colorToBackgroundClassName } from "../../../domain/Color";

type BoardTileProps = {
    color: Color;
}

function BoardTile({ color }: BoardTileProps) {
    return (
        <div className={colorToBackgroundClassName(color) + " rounded"}>
            <div className="rounded p-[2em] hover:bg-white/10" />
        </div>
    );
}

type BoardRowProps = {
    tiles: Color[];
}

function BoardRow({ tiles }: BoardRowProps) {
    return (
        <div className="flex flex-row gap-[0.5em]">
            {tiles.map((tileColor, i) => (
                <BoardTile key={i} color={tileColor} />
            ))}
        </div>
    );
}

type BoardProps = {
    tiles: Color[]; // length must be 36
}

function Board({ tiles }: BoardProps) {
    return (
        <div className="flex flex-col gap-[0.5em]">
            <BoardRow tiles={tiles.slice(0, 6)} />
            <BoardRow tiles={tiles.slice(6, 12)} />
            <BoardRow tiles={tiles.slice(12, 18)} />
            <BoardRow tiles={tiles.slice(18, 24)} />
            <BoardRow tiles={tiles.slice(24, 30)} />
            <BoardRow tiles={tiles.slice(30, 36)} />
        </div>
    );
}

export default Board;