import { describe, expect, it } from "vitest";
import { CART_MAX_NOTES_LENGTH, parseCartLines, sanitizeCartNoteInput } from "@/lib/cart-cookie";

describe("parseCartLines", () => {
  it("keeps notes within max length on read", () => {
    const note = "b".repeat(600);
    const lines = parseCartLines([{ menuItemId: "x", qty: 1, notes: note }]);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.notes?.length).toBe(CART_MAX_NOTES_LENGTH);
    expect(lines[0]?.notes).toBe("b".repeat(500));
  });

  it("omits blank notes after trim", () => {
    const lines = parseCartLines([{ menuItemId: "x", qty: 1, notes: "   " }]);
    expect(lines[0]).toEqual({ menuItemId: "x", qty: 1 });
  });

  it("preserves valid notes", () => {
    const lines = parseCartLines([{ menuItemId: "x", qty: 2, notes: "Nut allergy" }]);
    expect(lines[0]).toEqual({ menuItemId: "x", qty: 2, notes: "Nut allergy" });
  });
});

describe("sanitizeCartNoteInput", () => {
  it("truncates to max length after trim", () => {
    const long = "c".repeat(502);
    expect(sanitizeCartNoteInput(long)?.length).toBe(500);
  });
});
