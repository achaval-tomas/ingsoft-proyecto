export type NotificationType = "error" | "warning";

type Notification = {
    id: number;
    type: NotificationType;
    message: string;
    timeoutMillis: number | null;
}

export default Notification;