import { describe, expect, it } from "vitest";
import {
  getGroupSlugsForSourceSlug,
  GROUPED_MENU_TAXONOMY,
  isGroupedCategorySlug,
} from "./grouped-taxonomy";

describe("grouped taxonomy", () => {
  it("exposes stable groups in sort order", () => {
    expect(GROUPED_MENU_TAXONOMY.map((group) => group.slug)).toEqual([
      "main-meals",
      "budget-meals",
      "desserts-sweets",
      "drinks-refreshments",
      "snacks-light-bites",
      "best-sellers-featured",
      "grilled-heavy-meals",
    ]);
  });

  it("supports reverse lookup from source slug", () => {
    expect(getGroupSlugsForSourceSlug("burgers")).toEqual(["main-meals", "budget-meals", "best-sellers-featured"]);
    expect(getGroupSlugsForSourceSlug("bbqs")).toEqual(["best-sellers-featured", "grilled-heavy-meals"]);
    expect(getGroupSlugsForSourceSlug("our-foods")).toEqual([]);
    expect(getGroupSlugsForSourceSlug("best-foods")).toEqual([]);
    expect(getGroupSlugsForSourceSlug("unknown")).toEqual([]);
  });

  it("validates grouped category slugs", () => {
    expect(isGroupedCategorySlug("main-meals")).toBe(true);
    expect(isGroupedCategorySlug("burgers")).toBe(false);
  });
});
