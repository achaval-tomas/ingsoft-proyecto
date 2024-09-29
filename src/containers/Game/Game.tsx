import { useMemo } from "react";
import { intToColor } from "../../domain/Color";
import GameLayout from "./GameLayout";
import { Movement } from "../../domain/Movement";
import { Shape } from "../../domain/Shape";

function Game() {
    const tiles = useMemo(() => Array.from({ length: 36 }, () => intToColor(Math.floor(Math.random() * 4))), []);
    const movements: [Movement, Movement, Movement] = ["diagonal-adjacent", "l-ccw", "straight-adjacent"];
    const shapes: [Shape, Shape, Shape] = ["c-3", "b-1", "backside"]

    return (
        <GameLayout
            tiles={tiles}
            movements={movements}
            shapes={shapes}
        />
    );
}

export default Game;