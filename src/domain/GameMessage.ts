import { z } from "zod";
import { GameStateSchema, PlayerIdSchema } from "./GameState";

// Messages received from the backend
export const GameMessageInSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("turn-ended"), // Received when someone's turn has ended.
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
    z.object({
        type: z.literal("error"), // Received when the server has detected an error.
        message: z.string().optional(), // Display message for the error.
    }),
]);

// Messages sent to the backend
export const GameMessageOutSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("get-game-state"), // Request the entire game state.
    }),
    z.object({
        type: z.literal("end-turn"), // Manually end the current turn.
    }),
]);

export type GameMessageIn = z.infer<typeof GameMessageInSchema>;
export type GameMessageOut = z.infer<typeof GameMessageOutSchema>;
