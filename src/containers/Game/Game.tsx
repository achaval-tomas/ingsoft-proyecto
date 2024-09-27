import { useMemo } from "react";
import { intToColor } from "../../domain/Color";
import Board from "./components/Board";

function Game() {
    const tiles = useMemo(() => Array.from({ length: 36 }, () => intToColor(Math.floor(Math.random() * 4))), []);

    return (
        <div className="w-screen justify-center flex">
            <Board tiles={tiles} />
        </div>
    );
}

export default Game;