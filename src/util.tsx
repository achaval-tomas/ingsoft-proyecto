export function optionalClassName(className: string | null | undefined, def?: string): string {
    if (className === null) {
        return "";
    } else if (className === undefined) {
        if (def === undefined) {
            return "";
        } else {
            return " " + def;
        }
    } else {
        return " " + className;
    }
}
