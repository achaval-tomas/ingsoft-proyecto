import { useEffect, useState } from "react";
import GameLayout from "./GameLayout";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import gameService from "../../services/gameService";
import WinnerDialog from "./components/WinnerDialog";
import { toLobby } from "../../navigation/destinations";
import { MovementTarget } from "../../domain/Movement";
import { boardIndexToPosition, Position, positionsEqual, positionToBoardIndex } from "../../domain/Position";
import { GameState, PlayerId } from "../../domain/GameState";
import { GameMessageOut } from "../../domain/GameMessage";
import useGameUiState from "./hooks/useGameUiState";
import useMovementTargets from "./hooks/useMovementTargets";
import { getMovementCardIndexOrNull, SelectionState } from "./SelectionState";

type GameProps = {
    playerId: string;
    gameState: GameState;
    sendMessage: (message: GameMessageOut) => void;
}

function Game({ playerId, gameState, sendMessage }: GameProps) {
    const navigate = useNavigate();

    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);

    const [selectionState, setSelectionState] = useState<SelectionState>(null);

    useEffect(() => {
        if (gameState.currentRoundPlayer !== gameState.selfPlayerState.roundOrder) {
            setSelectionState(null);
        }
    }, [gameState.currentRoundPlayer, gameState.selfPlayerState.roundOrder]);

    useEffect(() => {
        const handleKeypress = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectionState(null);
            }
        };

        document.addEventListener("keyup", handleKeypress);
        return () => document.removeEventListener("keyup", handleKeypress);
    }, []);

    const movementTargets: MovementTarget[] = useMovementTargets(gameState, selectionState);

    const uiState = useGameUiState(gameState, selectionState, movementTargets);

    const handleEndTurn = () => {
        sendMessage({ type: "end-turn" });
    };

    const handleLeaveGame = () => {
        void gameService.leaveGame(playerId);
        navigate(toLobby(playerId));
    };

    const handleClickShapeCard = (playerId: PlayerId, shapeCardIndex: number) => {
        if (gameState.currentRoundPlayer !== gameState.selfPlayerState.roundOrder) {
            return;
        }

        // For now, only allow selecting self shape cards
        if (playerId !== gameState.selfPlayerState.id) {
            return;
        }

        if (selectionState?.type === "shape-card" && selectionState.playerId === playerId && selectionState.shapeCardIndex === shapeCardIndex) {
            setSelectionState(null);
            return;
        }

        setSelectionState({
            type: "shape-card",
            playerId,
            shapeCardIndex,
        });
    };

    const handleClickMovementCard = (movementCardIndex: number) => {
        if (gameState.currentRoundPlayer !== gameState.selfPlayerState.roundOrder) {
            return;
        }

        if (movementCardIndex >= gameState.selfPlayerState.movementCardsInHand.length) {
            return;
        }

        if (getMovementCardIndexOrNull(selectionState) === movementCardIndex) {
            setSelectionState(null);
        } else {
            setSelectionState({ type: "movement-card", movementCardIndex });
        }
    };

    const handleClickTile = (pos: Position) => {
        const tileIndex = positionToBoardIndex(pos);

        switch (selectionState?.type) {
            case "shape-card": {
                return;
            }
            case "movement-card": {
                setSelectionState({
                    type: "movement-card-with-source-tile",
                    movementCardIndex: selectionState.movementCardIndex,
                    sourceTileIndex: tileIndex,
                });
                return;
            }
            case "movement-card-with-source-tile": {
                if (tileIndex === selectionState.sourceTileIndex) {
                    setSelectionState({
                        type: "movement-card",
                        movementCardIndex: selectionState.movementCardIndex,
                    });
                    return;
                }

                const movementTarget = movementTargets.find(mt => positionsEqual(mt.position, pos));
                if (movementTarget == null) {
                    setSelectionState({
                        type: "movement-card-with-source-tile",
                        movementCardIndex: selectionState.movementCardIndex,
                        sourceTileIndex: tileIndex,
                    });
                    return;
                }

                sendMessage({
                    type: "use-movement-card",
                    position: boardIndexToPosition(selectionState.sourceTileIndex),
                    rotation: movementTarget.movementRotation,
                    movement: gameState.selfPlayerState.movementCardsInHand[selectionState.movementCardIndex],
                });
                setSelectionState(null);
                return;
            }
        }
    };

    return (
        <>
            <GameLayout
                uiState={uiState}
                onClickEndTurn={handleEndTurn}
                onClickLeaveGame={() => setShowLeaveGameDialog(true)}
                onClickShapeCard={handleClickShapeCard}
                onClickMovementCard={handleClickMovementCard}
                onClickTile={handleClickTile}
                onClickCancelMovement={() => sendMessage({ type: "cancel-movement" })}
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
                winnerName={uiState.winnerName}
                onClose={() => navigate(toLobby(playerId))}
            />
        </>
    );
}

export default Game;
