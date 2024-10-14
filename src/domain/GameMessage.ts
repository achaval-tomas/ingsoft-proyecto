import { z } from "zod";
import { GameStateSchema, PlayerIdSchema, ShapeCardStateSchema } from "./GameState";
import { RotationSchema } from "./Rotation";
import { MovementSchema } from "./Movement";

// Messages received from the backend
export const GameMessageInSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("turn-ended"), // Received when someone's turn has ended.
        playerId: PlayerIdSchema, // ID of the player whose turn has finished.
        newShapeCards: ShapeCardStateSchema.array().max(3), // New shape cards that have been handed out to the player, or [].
        // New movement cards that have been handed out to the player, or [].
        // This _only_ applies when this message is sent to the same player whose turn has ended.
        // Otherwise, we only care about the number of movement cards that were handed out,
        // but that is implicit, as it can be calculated from the game state.
        newMovementCards: MovementSchema.array().max(3).optional(),
    }),
    z.object({
        type: z.literal("player-won"), // Received when someone has won.
        playerId: PlayerIdSchema, // ID of the winner.
    }),
    z.object({
        type: z.literal("player-left"), // Received when someone has left.
        playerId: PlayerIdSchema, // ID of the player who has left.
    }),
    z.object({
        // Received after the start of the game, after it is requested,
        // and, if there is a game in progress, after the backend has
        // rejected one of our messages.
        type: z.literal("game-state"),
        gameState: GameStateSchema,
    }),
    z.object({
        // Received when a user makes a movement
        type: z.literal("movement-card-used"),
        position: z.tuple([z.number().min(0).max(5), z.number().min(0).max(5)]),
        rotation: RotationSchema,
        movement: MovementSchema,
    }),
    z.object({
        // Received when a user cancels a movement
        type: z.literal("movement-cancelled"),
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
    z.object({
        // use a movement card
        type: z.literal("use-movement-card"),
        position: z.tuple([z.number().min(0).max(5), z.number().min(0).max(5)]),
        rotation: RotationSchema,
        movement: MovementSchema,
    }),
    z.object({
        // cancel a temporal movement
        type: z.literal("cancel-movement"),
    }),
]);

export type GameMessageIn = z.infer<typeof GameMessageInSchema>;
export type GameMessageOut = z.infer<typeof GameMessageOutSchema>;
