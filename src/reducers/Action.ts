import { GameMessageIn } from "../domain/GameMessage";

type Action = GameMessageIn
    | {
        type: "clear-game-state";
    }
    | {
        type: "clear-notification";
        notificationId: number;
    }

export default Action;