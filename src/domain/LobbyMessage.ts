import { z } from "zod";
import { PlayerIdSchema } from "./GameState";

// Messages received from the backend
export const LobbyMessageInSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("player-joined"), // Received when someone has joined.
        player: z.object({
            id: PlayerIdSchema,
            name: z.string(),
        }),
    }),
    z.object({
        type: z.literal("player-left"), // Received when someone has left.
        playerId: PlayerIdSchema, // ID of the player who has left.
    }),
    z.object({
        type: z.literal("game-started"), // Received when the owner has started the game.
    }),
]);

export type LobbyMessageIn = z.infer<typeof LobbyMessageInSchema>;
