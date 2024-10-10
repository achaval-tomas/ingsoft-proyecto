import { useMemo, useState } from "react";
import GameLayout from "./GameLayout";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import useWinner from "./hooks/useWinner";
import gameService from "../../services/gameService";
import WinnerDialog from "./components/WinnerDialog";
import { toLobby } from "../../navigation/destinations";
import useFormedShapes from "./hooks/useFormedShapes";
import { getPossibleTargetsInBoard, PossibleTargetsInBoard } from "../../domain/Movement";
import { Position, positionsEqual } from "../../domain/Position";
import { RotationSchema } from "../../domain/Rotation";
import { GameState } from "../../domain/GameState";
import { GameMessageOut } from "../../domain/GameMessage";

type GameProps = {
    playerId: string;
    gameState: GameState;
    sendMessage: (message: GameMessageOut) => void;
}

function Game({ playerId, gameState, sendMessage }: GameProps) {
    const navigate = useNavigate();

    const winner = useWinner(gameState);

    const [showLeaveGameDialog, setShowLeaveGameDialog] = useState(false);

    const [selectedMovementCard, setSelectedMovementCard] = useState<number | null>(null);
    const [selectedTile, setSelectedTile] = useState<Position | null>(null);

    const shapeWhitelist = (selectedMovementCard == null) ? (
        gameState.selfPlayerState.shapeCardsInHand
            .concat(gameState.otherPlayersState.map(p => p.shapeCardsInHand).flat())
            .map(s => s.shape)
    ) : [];
    const formedShapes = useFormedShapes(gameState.boardState, shapeWhitelist);

    const tilesData = useMemo(
        () => gameState.boardState.tiles.map((color, i) => (
            {
                color,
                isHighlighted: formedShapes[i] != null
                    && gameState.boardState.tiles[i] !== gameState.boardState.blockedColor,
            }
        )),
        [gameState, formedShapes],
    );

    const selectableTiles: PossibleTargetsInBoard = useMemo(() => (selectedMovementCard != null && selectedTile != null)
        ? getPossibleTargetsInBoard(gameState.selfPlayerState.movementCardsInHand[selectedMovementCard], selectedTile)
        : {}, [gameState, selectedMovementCard, selectedTile]);


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

    const activeSide = playerIndexToActiveSide(
        [gameState.selfPlayerState, ...gameState.otherPlayersState]
            .findIndex(p => p.roundOrder === gameState.currentRoundPlayer),
    );

    return (
        <>
            <GameLayout
                tiles={tilesData}
                selfPlayerState={gameState.selfPlayerState}
                otherPlayersState={gameState.otherPlayersState}
                activeSide={activeSide}
                selectedMovementCard={selectedMovementCard}
                selectedTile={selectedTile}
                selectableTiles={Object.values(selectableTiles)}
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
