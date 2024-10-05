import { useSelector } from "react-redux";
import AppState from "../../../domain/AppState";
import { CommonPlayerState, getPlayerById } from "../../../domain/GameState";

function useWinnerSelector(): CommonPlayerState | undefined {
    return useSelector((state: AppState) => {
        const gs = state.gameState;
        if (gs == null || gs.winner == null) {
            return undefined;
        }

        return getPlayerById(gs, gs.winner);
    });
}

export default useWinnerSelector;
