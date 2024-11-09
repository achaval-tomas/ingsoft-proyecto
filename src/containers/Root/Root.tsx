import { Outlet } from "react-router-dom";

function Root() {
    return (
        <div className="grid w-screen h-screen">
            <div className="col-start-1 row-start-1">
                <Outlet />
            </div>
        </div>
    );
}

export default Root;