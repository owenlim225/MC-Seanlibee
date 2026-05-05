const DEFAULT_MENU_IMAGE_WIDTH = 640;
const DEFAULT_MENU_IMAGE_HEIGHT = 480;

function buildSvgFallback(menuItemId: string, width: number, height: number): string {
  const safeId = menuItemId.trim().toUpperCase();
  const label = safeId.charAt(0) || "?";
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#3F3F46"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <circle cx="${Math.round(width / 2)}" cy="${Math.round(height / 2)}" r="${Math.round(Math.min(width, height) * 0.22)}" fill="#27272A" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#E4E4E7" font-family="Arial, sans-serif" font-size="${Math.round(
    Math.min(width, height) * 0.2,
  )}" font-weight="700">${label}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resolve a menu image URL from seeded data.
 * Falls back to a deterministic image when source URLs are blank/missing.
 */
export function resolveMenuImageUrl(
  menuItemId: string,
  imageUrl: string | null | undefined,
  options?: { width?: number; height?: number },
): string {
  const normalized = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (normalized.length > 0) {
    return normalized;
  }

  const width = options?.width ?? DEFAULT_MENU_IMAGE_WIDTH;
  const height = options?.height ?? DEFAULT_MENU_IMAGE_HEIGHT;
  return buildSvgFallback(menuItemId, width, height);
}
