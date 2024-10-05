import { z } from "zod";
import { ColorSchema } from "./Color";
import { ShapeSchema } from "./Shape";
import { MovementSchema } from "./Movement";

export const PlayerIdSchema = z.string();
export type PlayerId = z.infer<typeof PlayerIdSchema>;

export const ShapeCardStateSchema = z.object({
    shape: ShapeSchema,
    isBlocked: z.boolean(),
});

export type ShapeCardState = z.infer<typeof ShapeCardStateSchema>;

export const CommonPlayerStateSchema = z.object({
    id: PlayerIdSchema,
    name: z.string(),
    roundOrder: z.number().int().min(0).max(3),
    shapeCardsInHand: ShapeCardStateSchema.array().max(3),
    shapeCardsInDeckCount: z.number().int().nonnegative(),
});

export type CommonPlayerState = z.infer<typeof CommonPlayerStateSchema>;

export const SelfPlayerStateSchema = z.intersection(
    CommonPlayerStateSchema,
    z.object({
        movementCardsInHand: MovementSchema.array().max(3),
    }),
);

export type SelfPlayerState = z.infer<typeof SelfPlayerStateSchema>;

export const OtherPlayerStateSchema = z.intersection(
    CommonPlayerStateSchema,
    z.object({
        movementCardsInHandCount: z.number().max(3),
    }),
);

export type OtherPlayerState = z.infer<typeof OtherPlayerStateSchema>;

export const BoardStateSchema = z.object({
    tiles: ColorSchema.array().length(36),
    blockedColor: ColorSchema.nullable(),
});

export type BoardState = z.infer<typeof BoardStateSchema>;

export const GameStateSchema = z.object({
    selfPlayerState: SelfPlayerStateSchema,
    otherPlayersState: OtherPlayerStateSchema.array().max(3),
    boardState: BoardStateSchema,
    // turnStart: z.string().datetime(),
    currentRoundPlayer: z.number().int().max(3),
    winner: PlayerIdSchema.optional(),
});

export type GameState = z.infer<typeof GameStateSchema>;
