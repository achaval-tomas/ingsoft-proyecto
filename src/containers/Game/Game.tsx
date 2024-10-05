import { useEffect, useMemo, useState } from "react";
import GameLayout from "./GameLayout";
import { CommonPlayerState, getPlayerById } from "../../domain/GameState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpServerUrl } from "../../services/config";
import ConfirmDialog from "../../components/ConfirmDialog";
import Dialog from "../../components/Dialog";
import FilledButton from "../../components/FilledButton";
import { useDispatch, useSelector } from "react-redux";
import AppState from "../../domain/AppState";
import { Dispatch } from "redux";
import Action from "../../reducers/Action";
import useGameWebSocket from "./hooks/useGameWebSocket";

function Game() {
    const [searchParams] = useSearchParams();
    const playerId = useMemo(() => searchParams.get("player")!, [searchParams]);
    const navigate = useNavigate();

    const dispatch = useDispatch<Dispatch<Action>>();
    const gameState = useSelector((state: AppState) => state.gameState);

    const winner: CommonPlayerState | undefined = useSelector((state: AppState) => {
        const gs = state.gameState;
        if (gs == null || gs.winner == null) {
            return undefined;
        }

        return getPlayerById(gs, gs.winner);
    });

    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);

    const sendMessage = useGameWebSocket(playerId, dispatch);
    // clear game state when exiting
    useEffect(() => (() => { dispatch({ type: "clear-game-state" }); }), [dispatch]);

    const handleEndTurn = () => {
        sendMessage({ type: "end-turn" });
    };

    const handleLeaveGame = () => {
        void fetch(`${httpServerUrl}/game/leave`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ playerId }),
        });
        navigate(`/lobby?player=${playerId}`);
    };

    if (gameState === null) {
        return <p>Loading...</p>;
    }

    const activeSide = playerIndexToActiveSide(
        [gameState.selfPlayerState, ...gameState.otherPlayersState]
            .findIndex(p => p.roundOrder === gameState.currentRoundPlayer),
    );

    return (
        <>
            <GameLayout
                tiles={gameState.boardState.tiles}
                selfPlayerState={gameState.selfPlayerState}
                otherPlayersState={gameState.otherPlayersState}
                activeSide={activeSide}
                onClickEndTurn={handleEndTurn}
                onClickLeaveGame={() => setShowLeaveGameDialog(true)}
            />
            <ConfirmDialog
                isOpen={showLeaveGameDialog}
                title="Abandonar"
                body="Abandonar partida?"
                dismissText="Cancelar"
                confirmText="Abandonar"
                onDismiss={() => setShowLeaveGameDialog(false)}
                onConfirm={handleLeaveGame}
            />
            {(winner != null) && <Dialog
                isOpen={true}
                onClose={() => navigate(`/lobby?player=${playerId}`)}
            >
                <div className="flex flex-col justify-center text-center gap-8">
                    <p className="text-xl">¡{winner.name} ganó!</p>
                    <FilledButton onClick={() => navigate(`/lobby?player=${playerId}`)}>
                        OK
                    </FilledButton>
                </div>
            </Dialog>}
        </>
    );
}

function playerIndexToActiveSide(index: number): "b" | "r" | "t" | "l" {
    switch (index) {
        case 0: return "b";
        case 1: return "r";
        case 2: return "t";
        case 3: return "l";
        default: return "b";
    }
}

export default Game;
