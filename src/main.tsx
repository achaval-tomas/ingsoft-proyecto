import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./containers/ErrorPage/ErrorPage.tsx";
import Game from "./containers/Game/Game.tsx";
import InitialPage from "./containers/App/containers/InitialPage.tsx";
import MainPage from "./containers/MainPage/MainPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <InitialPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/lobby",
        element: <MainPage />,
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
