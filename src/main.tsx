import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./containers/ErrorPage/ErrorPage.tsx";
import Game from "./containers/Game/Game.tsx";
import InitialPage from "./containers/InitialPage/InitialPage.tsx";
import MainPage from "./containers/MainPage/MainPage.tsx";
import Lobby from "./containers/Lobby/Lobby.tsx";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./reducers/rootReducer.ts";
import AppState from "./domain/AppState.ts";
import { GameMessageIn } from "./domain/GameMessage.ts";

const router = createBrowserRouter([
    {
        path: "/",
        element: <InitialPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/home",
        element: <MainPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/lobby",
        element: <Lobby />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/play",
        element: <Game />,
    },
]);

const store = createStore<AppState, GameMessageIn>(
    rootReducer,
    {
        gameState: null,
    },
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
