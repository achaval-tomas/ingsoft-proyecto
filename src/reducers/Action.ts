import { GameMessageIn } from "../domain/GameMessage";
import { NotificationType } from "../domain/Notification";

type Action = GameMessageIn
    | {
        type: "clear-game-state";
    }
    | {
        type: "clear-notification";
        notificationId: number;
    }
    | {
        type: "create-notification";
        notificationType: NotificationType;
        message: string;
        timeoutMillis: number | null;
    }

export default Action;