import { describe, expect, it } from "vitest";
import { buildFeaturedCategoryRail } from "@/lib/menu/featured-menu-image-quality";

describe("buildFeaturedCategoryRail", () => {
  it("keeps featured thumbnail URLs unique across categories", () => {
    const featured = buildFeaturedCategoryRail([
      {
        id: "c-1",
        slug: "one",
        name: "One",
        items: [{ name: "Alpha", imageUrl: "https://cdn.example.com/shared.jpg" }],
      },
      {
        id: "c-2",
        slug: "two",
        name: "Two",
        items: [{ name: "Beta", imageUrl: "https://cdn.example.com/shared.jpg" }],
      },
    ]);

    expect(featured).toHaveLength(1);
    expect(featured[0]?.id).toBe("c-1");
  });

  it("hides categories that have no valid image candidate", () => {
    const featured = buildFeaturedCategoryRail([
      {
        id: "invalid-only",
        slug: "invalid-only",
        name: "Invalid Only",
        items: [
          { name: "One", imageUrl: "" },
          { name: "Two", imageUrl: null },
          { name: "Three", imageUrl: "data:image/svg+xml;base64,abc" },
        ],
      },
      {
        id: "valid",
        slug: "valid",
        name: "Valid",
        items: [{ name: "Alpha", imageUrl: "https://cdn.example.com/valid.jpg" }],
      },
    ]);

    expect(featured).toEqual([
      {
        id: "valid",
        slug: "valid",
        name: "Valid",
        thumbnailUrl: "https://cdn.example.com/valid.jpg",
      },
    ]);
  });

  it("never returns known broken URLs", () => {
    const broken =
      "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/90005/award-winning-chocolate-4-layer-cake.b1667fe724c35e1461aad64bc1f982d3.jpeg?ixlib=react-9.0.2&auto=format&ar=1%3A1";
    const healthy = "https://cdn.example.com/healthy.jpg";

    const featured = buildFeaturedCategoryRail([
      {
        id: "with-fallback",
        slug: "with-fallback",
        name: "With Fallback",
        items: [
          { name: "A", imageUrl: broken },
          { name: "B", imageUrl: healthy },
        ],
      },
      {
        id: "broken-only",
        slug: "broken-only",
        name: "Broken Only",
        items: [{ name: "C", imageUrl: broken }],
      },
    ]);

    expect(featured).toHaveLength(1);
    expect(featured[0]?.thumbnailUrl).toBe(healthy);
    expect(featured.some((entry) => entry.thumbnailUrl === broken)).toBe(false);
  });
});
