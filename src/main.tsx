import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./containers/ErrorPage/ErrorPage.tsx";
import GamePage from "./containers/Game/GamePage.tsx";
import InitialPage from "./containers/InitialPage/InitialPage.tsx";
import LobbyListPage from "./containers/LobbyListPage/LobbyListPage.tsx";
import Lobby from "./containers/Lobby/Lobby.tsx";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./reducers/rootReducer.ts";
import AppState from "./domain/AppState.ts";
import { GameMessageIn } from "./domain/GameMessage.ts";
import Root from "./containers/Root/Root.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <InitialPage />,
            },
            {
                path: "lobbies",
                element: <LobbyListPage />,
            },
            {
                path: "lobby",
                element: <Lobby />,
            },
            {
                path: "play",
                element: <GamePage />,
            },
        ],
    },
]);

const initialAppState: AppState = {
    gameState: null,
    notifications: [
        {
            id: 0,
            type: "error",
            message: "this is an error",
            timeoutMillis: null,
        },
        {
            id: 1,
            type: "warning",
            message: "this is a warning",
            timeoutMillis: null,
        },
        {
            id: 2,
            type: "error",
            message: "this is another error",
            timeoutMillis: null,
        },
    ],
};

const store = createStore<AppState, GameMessageIn>(rootReducer, initialAppState);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
