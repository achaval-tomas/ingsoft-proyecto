import { Color, colorToBackgroundClassName } from "../../../domain/Color";

type BoardTileProps = {
    color: Color;
    selected: boolean;
    selectable: boolean;
    onClickTile: () => void;
}

function BoardTile({ color, selected, selectable, onClickTile }: BoardTileProps) {
    const borderStyle = selected ? { boxShadow: "0 0 2px 4px white" } : (selectable ? { boxShadow: "0 0 2px 4px orange" } : {});
    return (
        <div className={colorToBackgroundClassName(color) + " rounded shadow-md shadow-black"} onClick={onClickTile}>
            <div className="w-full h-full rounded border border-transparent hover:border-white" style={borderStyle} />
        </div>
    );
}

type BoardProps = {
    tiles: Color[]; // length must be 36
    activeSide: "b" | "r" | "t" | "l";
    tileSelected: number | null;
    tilesSelectable: number[];
    onClickTile: (i: number) => void;
}

function borderColorFromActiveSide(activeSide: "b" | "r" | "t" | "l"): string {
    switch (activeSide) {
        case "b": return "border-b-primary-400";
        case "r": return "border-r-primary-400";
        case "t": return "border-t-primary-400";
        case "l": return "border-l-primary-400";
    }
}

function Board({ tiles, activeSide, tileSelected, tilesSelectable, onClickTile }: BoardProps) {
    return (
        <div
            className={`grid h-full aspect-square gap-[3%] p-[3%] bg-zinc-700 h-fit rounded-lg shadow-md shadow-black border border-transparent ${borderColorFromActiveSide(activeSide)}`}
            style={{ grid: "repeat(6, 1fr) / repeat(6, 1fr)" }}
        >
            {tiles.map((t, i) => <BoardTile key={i} color={t} selected={i === tileSelected} selectable={tilesSelectable.includes(i)} onClickTile={() => onClickTile(i)} />)}
        </div>
    );
}

export default Board;
