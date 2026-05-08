import { describe, expect, it } from "vitest";
import { barWidthPercents } from "./status-distribution";

describe("barWidthPercents", () => {
  it("returns empty array for empty input", () => {
    expect(barWidthPercents([])).toEqual([]);
  });

  it("uses denominator 1 when all counts are zero", () => {
    expect(barWidthPercents([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it("scales to 100% for the maximum count", () => {
    expect(barWidthPercents([1, 3, 0])).toEqual([
      (1 / 3) * 100,
      100,
      0,
    ]);
  });

  it("preserves order", () => {
    expect(barWidthPercents([5, 2, 8])).toEqual([
      (5 / 8) * 100,
      (2 / 8) * 100,
      100,
    ]);
  });

  it("clamps negative counts to zero in the bar math", () => {
    expect(barWidthPercents([-1, 2])).toEqual([0, 100]);
  });
});
