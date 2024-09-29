import { z } from "zod";

export const ShapeSchema = z.enum(["line-4", "line-5", "square", "t", "z"]);

export type Shape = z.infer<typeof ShapeSchema>;
