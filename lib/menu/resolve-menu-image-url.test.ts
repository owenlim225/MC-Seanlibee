import { describe, expect, it } from "vitest";
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

describe("resolveMenuImageUrl", () => {
  it("returns the original image URL when present", () => {
    const actual = resolveMenuImageUrl("menu-item-1", "https://cdn.example.com/item.jpg");
    expect(actual).toBe("https://cdn.example.com/item.jpg");
  });

  it("returns an inline svg data URI when image URL is missing", () => {
    const actual = resolveMenuImageUrl("menu-item-2", "");
    expect(actual.startsWith("data:image/svg+xml")).toBe(true);
    expect(actual).toContain(encodeURIComponent(">M<"));
  });
});
