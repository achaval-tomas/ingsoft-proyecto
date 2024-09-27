import { useMemo } from "react";
import { intToColor } from "../../domain/Color";
import GameLayout from "./GameLayout";
import { Movement } from "../../domain/Movement";

function Game() {
    const tiles = useMemo(() => Array.from({ length: 36 }, () => intToColor(Math.floor(Math.random() * 4))), []);
    const movements: [Movement, Movement, Movement] = ["diagonal-adjacent", "l-ccw", "straight-adjacent"];

    return (
        <GameLayout
            tiles={tiles}
            movements={movements}
        />
    );
}

export default Game;