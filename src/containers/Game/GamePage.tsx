import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppState from "../../domain/AppState";
import Game from "./Game";
import useGameWebSocket from "./hooks/useGameWebSocket";
import Action from "../../reducers/Action";
import { Dispatch } from "redux";

function GamePage() {
    const [searchParams] = useSearchParams();
    const playerId = useMemo(() => searchParams.get("player")!, [searchParams]);

    const gameState = useSelector((state: AppState) => state.gameState);

    const dispatch = useDispatch<Dispatch<Action>>();
    const sendMessage = useGameWebSocket(playerId, dispatch);
    // clear game state when exiting
    useEffect(() => (() => { dispatch({ type: "clear-game-state" }); }), [dispatch]);

    if (gameState === null) {
        return (
            <div className="flex w-screen h-screen justify-center items-center">
                <p className="animate-pulse text-2xl">Loading...</p>
            </div>
        );
    }

    return (
        <Game
            gameState={gameState}
            sendMessage={sendMessage}
        />
    );
}

export default GamePage;
