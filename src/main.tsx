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
                path: "lobby/:lobbyId",
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
    notifications: [],
    chatMessages: [],
};

const store = createStore<AppState, GameMessageIn>(rootReducer, initialAppState);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
