import { z } from "zod";
import { PlayerIdSchema } from "./GameState";

// Messages received from the backend
export const LobbyMessageInSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("player-list"), // Received when someone has joined.
        players: z
            .object({
                id: PlayerIdSchema,
                name: z.string(),
            })
            .array(),
    }),
    z.object({
        type: z.literal("game-started"), // Received when the owner has started the game.
    }),
    z.object({
        type: z.literal("lobby-state"),
        players: z
            .object({
                id: PlayerIdSchema,
                name: z.string(),
            })
            .array(),
        owner: PlayerIdSchema,
        id: z.string(),
    }),
]);

export type LobbyMessageIn = z.infer<typeof LobbyMessageInSchema>;
