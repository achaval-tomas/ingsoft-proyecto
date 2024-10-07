import { useEffect, useMemo, useState } from "react";
import GameLayout from "./GameLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import AppState from "../../domain/AppState";
import { Dispatch } from "redux";
import Action from "../../reducers/Action";
import useGameWebSocket from "./hooks/useGameWebSocket";
import useWinnerSelector from "./hooks/useWinnerSelector";
import gameService from "../../services/gameService";
import WinnerDialog from "./components/WinnerDialog";
import { toLobby } from "../../navigation/destinations";

function Game() {
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<Action>>();

    const [searchParams] = useSearchParams();
    const playerId = useMemo(() => searchParams.get("player")!, [searchParams]);

    const gameState = useSelector((state: AppState) => state.gameState);
    const winner = useWinnerSelector();

    const sendMessage = useGameWebSocket(playerId, dispatch);
    // clear game state when exiting
    useEffect(() => (() => { dispatch({ type: "clear-game-state" }); }), [dispatch]);

    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);


    const [movementCardSelected, setMovementCardSelected] = useState<number | null>(null);
    const [tileSelected, setTileSelected] = useState<number | null>(null);


    const handleEndTurn = () => {
        sendMessage({ type: "end-turn" });
    };

    const handleLeaveGame = () => {
        void gameService.leaveGame(playerId);
        navigate(toLobby(playerId));
    };

    const handleClickMovementCard = (i: number) => {
        if (gameState === null) {
            return;
        }

        if (gameState.selfPlayerState.movementCardsInHand.length < i + 1) {
            return;
        }

        setMovementCardSelected(movementCardSelected === i ? null : i);
        setTileSelected(null);
    };

    const handleClickTile = (i: number) => {
        if (movementCardSelected === null) {
            return;
        }

        if (tileSelected === null) {
            setTileSelected(i);
            return;
        }

        // use movement card
    };

    if (gameState === null) {
        return (
            <div className="flex w-screen h-screen justify-center items-center">
                <p className="animate-pulse text-2xl">Loading...</p>
            </div>
        );
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
                movementCardSelected={movementCardSelected}
                tileSelected={tileSelected}
                onClickEndTurn={handleEndTurn}
                onClickLeaveGame={() => setShowLeaveGameDialog(true)}
                onClickMovementCard={handleClickMovementCard}
                onClickTile={handleClickTile}
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
            <WinnerDialog
                winner={winner}
                onClose={() => navigate(toLobby(playerId))}
            />
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
