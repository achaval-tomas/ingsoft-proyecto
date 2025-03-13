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

export function createWarningNotification(message: string): Action {
    return {
        type: "create-notification",
        notificationType: "warning",
        message,
        timeoutMillis: 5000,
    };
}

export function createErrorNotification(message: string): Action {
    return {
        type: "create-notification",
        notificationType: "warning",
        message,
        timeoutMillis: 30000,
    };
}

export default Action;