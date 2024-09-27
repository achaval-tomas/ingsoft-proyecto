export function classNames(classNames: (string | null)[]): string {
    return classNames.filter(cn => cn != null).join(" ");
}
