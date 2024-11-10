import { useEffect, useState } from "react";
import GameLayout from "./GameLayout";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import gameService from "../../services/gameService";
import WinnerDialog from "./components/WinnerDialog";
import { toLobbyList } from "../../navigation/destinations";
import { MovementTarget } from "../../domain/Movement";
import { boardIndexToPosition, Position, positionsEqual, positionToBoardIndex } from "../../domain/Position";
import { GameState, getPlayerById, PlayerId } from "../../domain/GameState";
import { GameMessageOut } from "../../domain/GameMessage";
import useGameUiState from "./hooks/useGameUiState";
import useMovementTargets from "./hooks/useMovementTargets";
import { getMovementCardIndexOrNull, SelectionState } from "./SelectionState";
import { getShapeAtOrNull } from "../../domain/Board";
import { useDispatch, useSelector } from "react-redux";
import AppState from "../../domain/AppState";
import { createErrorNotification } from "../../reducers/Action";

type GameProps = {
    gameId: string;
    gameState: GameState;
    sendMessage: (message: GameMessageOut) => void;
}

function Game({ gameId, gameState, sendMessage }: GameProps) {
    const playerId = gameState.selfPlayerState.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const chatMessages = useSelector((state: AppState) => state.chatMessages);

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
        void gameService.leaveGame(gameId, playerId);
        navigate(toLobbyList(playerId));
    };

    const handleClickShapeCard = (playerId: PlayerId, shapeCardIndex: number) => {
        if (gameState.currentRoundPlayer !== gameState.selfPlayerState.roundOrder) {
            return;
        }

        // Toggle selection logic.
        if (
            selectionState?.type === "shape-card"
            && selectionState.playerId === playerId
            && selectionState.shapeCardIndex === shapeCardIndex
        ) {
            setSelectionState(null);
            return;
        }

        const targetPlayer = getPlayerById(gameState, playerId);
        if (targetPlayer == null) {
            return;
        }

        const targetShapeCard = targetPlayer.shapeCardsInHand[shapeCardIndex];

        // Don't select the shape card if it's blocked, unless it is ours and it is the last one in hand.
        if (
            targetShapeCard.isBlocked
            && !(playerId === gameState.selfPlayerState.id && gameState.selfPlayerState.shapeCardsInHand.length === 1)
        ) {
            return;
        }

        // Don't select someone else's shape card if they already have a blocked shape card.
        if (playerId !== gameState.selfPlayerState.id && targetPlayer.shapeCardsInHand.find(s => s.isBlocked) != null) {
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

    const handleClickTile = (position: Position) => {
        const tileIndex = positionToBoardIndex(position);

        switch (selectionState?.type) {
            case "shape-card": {
                const { boardState } = gameState;

                const tileColor = boardState.tiles[tileIndex];
                if (tileColor === boardState.blockedColor) {
                    return;
                }

                const shapePlayer = getPlayerById(gameState, selectionState.playerId);
                if (shapePlayer == null) {
                    return;
                }

                const shapeCardState = shapePlayer.shapeCardsInHand[selectionState.shapeCardIndex];
                if (shapeCardState == null) {
                    return;
                }

                const shapeAtTile = getShapeAtOrNull(boardState.tiles, position);
                if (shapeAtTile !== shapeCardState.shape) {
                    return;
                }

                sendMessage({
                    type: "use-shape-card",
                    position,
                    targetPlayerId: selectionState.playerId,
                });
                setSelectionState(null);
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

                const movementTarget = movementTargets.find(mt => positionsEqual(mt.position, position));
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

    const handleSendChatMessage = async (text: string) => {
        try {
            const res = await gameService.sendChatMessage(gameId, playerId, text);

            if (res.ok) {
                return;
            }

            console.log(await res.json());
        } catch (e) {
            console.log(e);
        }

        dispatch(createErrorNotification("Ocurrió un error al enviar el mensaje."));
    };

    return (
        <>
            <GameLayout
                uiState={uiState}
                chatMessages={chatMessages}
                onSendChatMessage={text => void handleSendChatMessage(text)}
                onClickEndTurn={handleEndTurn}
                onClickLeaveGame={() => setShowLeaveGameDialog(true)}
                onNavToLobbyList={() => navigate(toLobbyList(playerId))}
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
                onClose={() => navigate(toLobbyList(playerId))}
            />
        </>
    );
}

export default Game;
