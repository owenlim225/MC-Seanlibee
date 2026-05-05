import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("accepts same-origin relative paths starting with a single slash", () => {
    expect(safeNextPath("/customer")).toBe("/customer");
    expect(safeNextPath("/customer/orders/abc")).toBe("/customer/orders/abc");
    expect(safeNextPath("/admin?tab=audit")).toBe("/admin?tab=audit");
  });

  it("rejects schemeless host paths starting with //", () => {
    expect(safeNextPath("//evil.example.com")).toBe("/");
    expect(safeNextPath("//evil.example.com/path", "/home")).toBe("/home");
  });

  it("rejects backslash escape variants", () => {
    expect(safeNextPath("/\\evil.example.com")).toBe("/");
  });

  it("rejects absolute URLs and protocol handlers", () => {
    expect(safeNextPath("https://evil.example.com")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
    expect(safeNextPath("data:text/html,foo")).toBe("/");
  });

  it("rejects paths that do not start with a slash", () => {
    expect(safeNextPath("customer")).toBe("/");
    expect(safeNextPath("../../etc/passwd")).toBe("/");
  });

  it("returns fallback for non-string or empty input", () => {
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(123)).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath("", "/login")).toBe("/login");
  });
});
