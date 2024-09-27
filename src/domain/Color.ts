export type Color = "red" | "green" | "blue" | "yellow";

export function colorToBackgroundClassName(color: Color): string {
    switch (color) {
        case "red":
            return "bg-red-500";
        case "green":
            return "bg-green-500";
        case "blue":
            return "bg-blue-500";
        case "yellow":
            return "bg-yellow-500";
    }
}

export function intToColor(value: number): Color {
    switch (value) {
        case 0:
            return "red";
        case 1:
            return "green";
        case 2:
            return "blue";
        case 3:
            return "yellow";
        default:
            throw Error("invalid value");
    }
}
