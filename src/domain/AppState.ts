import ChatMessage from "./ChatMessage";
import { GameState } from "./GameState";
import Notification from "./Notification";

type AppState = {
    gameState: GameState | null;
    notifications: Notification[];
    chatMessages: ChatMessage[];
}

export default AppState;