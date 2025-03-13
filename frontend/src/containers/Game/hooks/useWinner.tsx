import { CommonPlayerState, GameState, getPlayerById } from "../../../domain/GameState";
import { useMemo } from "react";

function useWinner(gameState: GameState): CommonPlayerState | undefined {
    return useMemo(() => {
        if (gameState.winner == null) {
            return undefined;
        }

        return getPlayerById(gameState, gameState.winner);
    }, [gameState]);
}

export default useWinner;
