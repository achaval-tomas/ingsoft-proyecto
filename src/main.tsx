import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./containers/App/App.tsx";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./containers/ErrorPage/ErrorPage.tsx";
import Game from "./containers/Game/Game.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/play",
        element: <Game />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
