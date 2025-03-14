import { z } from "zod";

export const ShapeSchema = z.enum([
    "c-0", "c-1", "c-2", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8", "c-9",
    "c-10", "c-11", "c-12", "c-13", "c-14", "c-15", "c-16", "c-17",
    "b-0", "b-1", "b-2", "b-3", "b-4", "b-5", "b-6",
]);

export const allShapes = ShapeSchema.options;

export type Shape = z.infer<typeof ShapeSchema>;
