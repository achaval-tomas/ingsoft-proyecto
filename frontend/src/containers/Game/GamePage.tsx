import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppState from "../../domain/AppState";
import Game from "./Game";
import useGameWebSocket from "./hooks/useGameWebSocket";
import Action from "../../reducers/Action";
import { Dispatch } from "redux";
import useUrlPlayerId from "../../hooks/useUrlPlayerId";
import { toInitial, toLobbyList } from "../../navigation/destinations";

function GamePage() {
    const gameId = useParams<{ gameId: string }>().gameId ?? null;
    const playerId = useUrlPlayerId();

    const gameState = useSelector((state: AppState) => state.gameState);

    const dispatch = useDispatch<Dispatch<Action>>();
    const sendMessage = useGameWebSocket(gameId, playerId, dispatch);
    // clear game state when exiting
    useEffect(() => (() => { dispatch({ type: "clear-game-state" }); }), [dispatch]);

    if (playerId == null) {
        return <Navigate to={toInitial()} replace />;
    }

    if (gameId == null) {
        return <Navigate to={toLobbyList(playerId)} replace />;
    }

    if (gameState === null) {
        return (
            <div className="flex w-screen h-screen justify-center items-center">
                <p className="animate-pulse text-2xl">Loading...</p>
            </div>
        );
    }

    return (
        <Game
            gameId={gameId}
            gameState={gameState}
            sendMessage={sendMessage}
        />
    );
}

export default GamePage;
