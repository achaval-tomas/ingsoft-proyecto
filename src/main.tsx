import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import CreateLobbyDialog from "./containers/App/components/CreateLobbyDialog.tsx";
import ErrorPage from "./containers/ErrorPage/ErrorPage.tsx";
import InitialPage from "./containers/App/containers/InitialPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <InitialPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/play",
        element: <CreateLobbyDialog
            isOpen = {true}
            lobbyNamePlaceholder = {"Nombre de tu sala"}
            onCancel = {() => {}}
            onSubmit = {() => {}}
        />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
