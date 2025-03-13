import ChatMessage from "./ChatMessage";
import { GameState } from "./GameState";
import Notification from "./Notification";

type AppState = {
    gameState: GameState | null;
    notifications: Notification[];
    chatMessages: ChatMessage[];
}

// This value is used to correct time desync between client and server.
// It is computed as clientNow - serverNow.
export const clockSyncOffsetInMillis = { value: 0 };

export default AppState;