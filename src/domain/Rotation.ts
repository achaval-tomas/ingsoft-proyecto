import { z } from "zod";

export const RotationSchema = z.enum(["r0", "r90", "r180", "r270"]);
export type Rotation = z.infer<typeof RotationSchema>;
