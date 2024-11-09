import { GameState } from "./GameState";
import Notification from "./Notification";

type AppState = {
    gameState: GameState | null;
    notifications: Notification[];
}

export default AppState;