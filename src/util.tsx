import { Color } from "./domain/Color";

export function classNames(classNames: (string | null)[]): string {
    return classNames.filter(cn => cn != null).join(" ");
}

export function reverseFlattenRowArray<T>(rows: T[][]): T[] {
    return rows.toReversed().flat();
}

export function toBoardTiles(rows: string[]): Color[] {
    return reverseFlattenRowArray(rows.map(w => w.split(""))).map<Color>(c => {
        switch (c) {
            case "r": return "red";
            case "g": return "green";
            case "b": return "blue";
            case "y": return "yellow";
            default: throw new Error(`invalid color char ${c}`);
        }
    });
}
