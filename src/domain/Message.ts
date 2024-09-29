import { z } from "zod";
import { GameStateSchema, PlayerIdSchema } from "./GameState";

export const InMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("turn-end"), // Received when someone's turn has ended.
        playerId: PlayerIdSchema, // ID of the player whose turn has finished.
    }),
    z.object({
        type: z.literal("winner"), // Received when someone has won.
        playerId: PlayerIdSchema, // ID of the winner.
    }),
    z.object({
        // Received after the start of the game, after it is requested,
        // and, if there is a game in progress, after the backend has
        // rejected one of our messages.
        type: z.literal("game-state"),
        gameState: GameStateSchema,
    }),
]);

export const OutMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("start-game"),
        lobbyId: z.string(),
    }),
    z.object({
        type: z.literal("get-game-state"), // Request the entire game state.
    }),
    z.object({
        type: z.literal("end-turn"), // Manually end the current turn.
    }),
]);

export type InMessage = z.infer<typeof InMessageSchema>;
export type OutMessage = z.infer<typeof OutMessageSchema>;
