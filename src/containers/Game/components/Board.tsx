import { Color, colorToBackgroundClassName } from "../../../domain/Color";

type BoardTileProps = {
    color: Color;
}

function BoardTile({ color }: BoardTileProps) {
    return (
        <div className={colorToBackgroundClassName(color) + " rounded shadow-md shadow-black"}>
            <div className="rounded p-[2em] border border-transparent hover:border-white" />
        </div>
    );
}

type BoardRowProps = {
    tiles: Color[];
}

function BoardRow({ tiles }: BoardRowProps) {
    return (
        <div className="flex flex-row gap-[1em]">
            {tiles.map((tileColor, i) => (
                <BoardTile key={i} color={tileColor} />
            ))}
        </div>
    );
}

type BoardProps = {
    tiles: Color[]; // length must be 36
    activeSide: "b" | "r" | "t" | "l";
}

function borderColorFromActiveSide(activeSide: "b" | "r" | "t" | "l"): string {
    switch (activeSide) {
        case "b": return "border-b-primary-400";
        case "r": return "border-r-primary-400";
        case "t": return "border-t-primary-400";
        case "l": return "border-l-primary-400";
    }
}

function Board({ tiles, activeSide }: BoardProps) {
    return (
        <div className={`flex flex-col gap-[1em] p-[1em] bg-zinc-700 h-fit rounded-lg shadow-md shadow-black border border-transparent ${borderColorFromActiveSide(activeSide)}`}>
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