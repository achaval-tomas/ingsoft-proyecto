import { z } from "zod";

export const MovementSchema = z.enum([
    "straight-adjacent",
    "straight-spaced",
    "straight-edge",
    "diagonal-adjacent",
    "diagonal-spaced",
    "l-ccw",
    "l-cw",
]);

export type Movement = z.infer<typeof MovementSchema>;

export type MovementData = {
    clamps: boolean;
    target: [number, number];
};
