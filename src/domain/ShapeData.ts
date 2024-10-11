import { allShapes, Shape } from "./Shape";
import { Position, rotatePositions90, sortPositions } from "./Position";
import { Rotation } from "./Rotation";

export type ShapeData = readonly Position[];

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

export function normalizeShapeData(shapeData: ShapeData): ShapeData {
    const [minX, minY] = shapeData.reduce(([lhsX, lhsY], [rhsX, rhsY]) => [
        Math.min(lhsX, rhsX),
        Math.min(lhsY, rhsY),
    ]);

    const normalized = sortPositions(shapeData.map(([x, y]) => [x - minX, y - minY]));

    return normalized;
}


export type ShapeWithData = {
    shape: Shape;
    rotation: Rotation;
    shapeData: ShapeData;
}

const validShapeDataDict: { [normalizedShapeDataJson: string]: ShapeWithData } = Object.fromEntries(
    allShapes
        .map<ShapeWithData[]>(shape => {
            const rotated0 = normalizeShapeData(getShapeData(shape));
            const rotated90 = normalizeShapeData(rotatePositions90(rotated0));
            const rotated180 = normalizeShapeData(rotatePositions90(rotated90));
            const rotated270 = normalizeShapeData(rotatePositions90(rotated180));

            return [
                { shape, rotation: "r0", shapeData: rotated0 },
                { shape, rotation: "r90", shapeData: rotated90 },
                { shape, rotation: "r180", shapeData: rotated180 },
                { shape, rotation: "r270", shapeData: rotated270 },
            ];
        })
        .flat()
        .map(shapeWithData => [JSON.stringify(shapeWithData.shapeData), shapeWithData]),
);

// shapeData must be normalized
export function getShapeFromNormalizedShapeData(shapeData: ShapeData): ShapeWithData | undefined {
    return validShapeDataDict[JSON.stringify(shapeData)];
}
