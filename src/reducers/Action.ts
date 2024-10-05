import { GameMessageIn } from "../domain/GameMessage";

type Action = GameMessageIn
    | {
        type: "clear-game-state";
    }

export default Action;