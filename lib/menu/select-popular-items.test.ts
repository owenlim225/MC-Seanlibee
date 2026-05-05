import { describe, expect, it } from "vitest";
import { POPULAR_ITEM_LIMIT, selectPopularItems } from "./select-popular-items";

describe("selectPopularItems", () => {
  it("orders by category sortOrder then item name and caps at default limit", () => {
    const categories = [
      {
        id: "c2",
        name: "Second",
        sortOrder: 2,
        items: [
          { id: "i4", name: "Zebra", priceCents: 100, imageUrl: null },
          { id: "i3", name: "Apple", priceCents: 200, imageUrl: null },
        ],
      },
      {
        id: "c1",
        name: "First",
        sortOrder: 1,
        items: [
          { id: "i2", name: "Mango", priceCents: 300, imageUrl: null },
          { id: "i1", name: "Banana", priceCents: 400, imageUrl: null },
        ],
      },
    ];

    const picked = selectPopularItems(categories);

    expect(picked.map((i) => i.id)).toEqual(["i1", "i2", "i3", "i4"]);
    expect(picked).toHaveLength(4);
    expect(POPULAR_ITEM_LIMIT).toBe(12);
  });

  it("respects custom limit and includes items without images", () => {
    const categories = [
      {
        id: "c1",
        name: "A",
        sortOrder: 0,
        items: [
          { id: "a", name: "A1", priceCents: 1, imageUrl: null },
          { id: "b", name: "A2", priceCents: 2, imageUrl: "https://example.com/x.png" },
          { id: "c", name: "A3", priceCents: 3, imageUrl: null },
        ],
      },
    ];

    expect(selectPopularItems(categories, 2).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("returns empty when no items", () => {
    expect(selectPopularItems([{ id: "c", name: "Empty", sortOrder: 0, items: [] }])).toEqual([]);
  });
});
