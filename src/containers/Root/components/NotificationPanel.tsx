import { useDispatch, useSelector } from "react-redux";
import AppState from "../../../domain/AppState";
import { NotificationType } from "../../../domain/Notification";
import Action from "../../../reducers/Action";
import { Dispatch } from "redux";

function notificationTypeToBackgroundColor(notificationType: NotificationType): string {
    switch (notificationType) {
        case "error": return "bg-red-600";
        case "warning": return "bg-yellow-600";
    }
}

function NotificationPanel() {
    const dispatch = useDispatch<Dispatch<Action>>();
    const notifications = useSelector((appState: AppState) => appState.notifications);

    return (
        <div className="m-4 gap-4 flex flex-col">
            {notifications.map(n => (
                <div key={n.id} className={`flex flex-row rounded-lg w-96 shadow shadow-black ${notificationTypeToBackgroundColor(n.type)}`}>
                    <p className="grow ps-4 py-4">{n.message}</p>
                    <div
                        className="flex p-4 cursor-pointer hover:bg-white/5 items-center"
                        onClick={() => dispatch({ type: "clear-notification", notificationId: n.id })}
                    >
                        <div className="material-symbols-outlined">close</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default NotificationPanel;