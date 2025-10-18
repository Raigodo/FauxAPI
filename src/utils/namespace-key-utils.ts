export function joinToNamespaceKey(parts: (string | null | undefined)[]): string {
    return (
        "/" +
        parts
            .filter((p): p is string => !!p) // remove null/undefined/empty
            .map((p) => p.replace(/^\/+|\/+$/g, "")) // remove leading/trailing slashes
            .filter((p) => p.length > 0) // remove empty segments
            .join("/")
    );
}
