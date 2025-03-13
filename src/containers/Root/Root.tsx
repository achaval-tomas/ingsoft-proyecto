import { Outlet } from "react-router-dom";
import NotificationPanel from "./components/NotificationPanel";

function Root() {
    return (
        <div className="grid w-screen h-screen">
            <div className="col-start-1 row-start-1">
                <Outlet />
            </div>
            <div className="col-start-1 row-start-1 justify-self-end">
                <NotificationPanel />
            </div>
        </div>
    );
}

export default Root;