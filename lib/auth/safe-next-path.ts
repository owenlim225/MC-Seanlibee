/**
 * Validate a `?next=...` redirect target. Returns the path if it is a safe
 * same-origin relative URL, otherwise the supplied fallback.
 *
 * Safe paths: start with a single `/`, no protocol, no `//` schemeless host.
 */
export function safeNextPath(next: unknown, fallback: string = "/"): string {
  if (typeof next !== "string") return fallback;
  if (next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/\\")) return fallback;
  if (/^\/\s*[a-z][a-z0-9+.-]*:/i.test(next)) return fallback;
  return next;
}
