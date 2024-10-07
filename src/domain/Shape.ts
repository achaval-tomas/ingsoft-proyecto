import { z } from "zod";

export const ShapeSchema = z.enum([
    "c-0", "c-1", "c-2", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8", "c-9",
    "c-10", "c-11", "c-12", "c-13", "c-14", "c-15", "c-16", "c-17",
    "b-0", "b-1", "b-2", "b-3", "b-4", "b-5", "b-6",
]);

export type Shape = z.infer<typeof ShapeSchema>;

export type ShapeData = [number, number][];

export function getShapeData(shape: Shape): ShapeData {
    switch (shape) {
        case "c-0": return [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]];
        case "c-1": return [[0, 1], [1, 1], [1, 0], [2, 0], [3, 0]];
        case "c-2": return [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1]];
        case "c-3": return [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]];
        case "c-4": return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
        case "c-5": return [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]];
        case "c-6": return [[0, 1], [1, 1], [2, 1], [3, 0], [3, 1]];
        case "c-7": return [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]];
        case "c-8": return [[0, 1], [1, 0], [1, 1], [2, 1], [2, 2]];
        case "c-9": return [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]];
        case "c-10": return [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]];
        case "c-11": return [[0, 1], [0, 2], [1, 1], [2, 0], [2, 1]];
        case "c-12": return [[0, 1], [1, 1], [2, 0], [2, 1], [3, 1]];
        case "c-13": return [[0, 0], [1, 0], [2, 0], [2, 1], [3, 0]];
        case "c-14": return [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]];
        case "c-15": return [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1]];
        case "c-16": return [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]];
        case "c-17": return [[0, 1], [1, 0], [1, 1], [2, 0], [2, 1]];
        case "b-0": return [[0, 0], [1, 0], [1, 1], [2, 1]];
        case "b-1": return [[0, 0], [0, 1], [1, 0], [1, 1]];
        case "b-2": return [[0, 1], [1, 0], [1, 1], [2, 0]];
        case "b-3": return [[0, 0], [1, 0], [1, 1], [2, 0]];
        case "b-4": return [[0, 1], [1, 1], [2, 0], [2, 1]];
        case "b-5": return [[0, 0], [1, 0], [2, 0], [3, 0]];
        case "b-6": return [[0, 0], [1, 0], [2, 0], [2, 1]];
    }
}