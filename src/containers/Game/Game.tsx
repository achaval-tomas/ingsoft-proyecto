import { useMemo, useState } from "react";
import GameLayout from "./GameLayout";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import gameService from "../../services/gameService";
import WinnerDialog from "./components/WinnerDialog";
import { toLobby } from "../../navigation/destinations";
import { getPossibleTargetsInBoard, PossibleTargetsInBoard } from "../../domain/Movement";
import { Position, positionsEqual } from "../../domain/Position";
import { RotationSchema } from "../../domain/Rotation";
import { GameState } from "../../domain/GameState";
import { GameMessageOut } from "../../domain/GameMessage";
import useGameUiState from "./hooks/useGameUiState";

type GameProps = {
    playerId: string;
    gameState: GameState;
    sendMessage: (message: GameMessageOut) => void;
}

function Game({ playerId, gameState, sendMessage }: GameProps) {
    const navigate = useNavigate();

    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);

    const [selectedMovementCard, setSelectedMovementCard] = useState<number | null>(null);
    const [selectedTile, setSelectedTile] = useState<Position | null>(null);

    const selectableTiles: PossibleTargetsInBoard = useMemo(() => (selectedMovementCard != null && selectedTile != null)
        ? getPossibleTargetsInBoard(gameState.selfPlayerState.movementCardsInHand[selectedMovementCard], selectedTile)
        : {}, [gameState, selectedMovementCard, selectedTile]);

    const uiState = useGameUiState(gameState, selectedMovementCard, selectedTile);

    const handleEndTurn = () => {
        sendMessage({ type: "end-turn" });
    };

    const handleLeaveGame = () => {
        void gameService.leaveGame(playerId);
        navigate(toLobby(playerId));
    };

    const handleClickMovementCard = (i: number) => {
        if (gameState.selfPlayerState.roundOrder !== gameState.currentRoundPlayer) {
            return;
        }

        if (gameState.selfPlayerState.movementCardsInHand.length < i + 1) {
            return;
        }

        setSelectedMovementCard(selectedMovementCard === i ? null : i);
        setSelectedTile(null);
    };

    const handleClickTile = (pos: Position) => {
        if (selectedMovementCard == null) {
            return;
        }

        if (selectedTile == null) {
            setSelectedTile(pos);
            return;
        }

        const rotation = (Object.values(RotationSchema.enum)).find(r =>
            selectableTiles[r] != null && positionsEqual(selectableTiles[r], pos),
        );

        if (rotation == null) {
            setSelectedTile(pos);
            return;
        }

        sendMessage({
            type: "use-movement-card",
            position: selectedTile,
            rotation: rotation,
            movement: gameState.selfPlayerState.movementCardsInHand[selectedMovementCard],
        });

        setSelectedMovementCard(null);
        setSelectedTile(null);
    };


    return (
        <>
            <GameLayout
                uiState={uiState}
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
                winnerName={uiState.winnerName}
                onClose={() => navigate(toLobby(playerId))}
            />
        </>
    );
}

export default Game;
