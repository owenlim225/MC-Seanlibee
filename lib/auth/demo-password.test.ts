import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkDemoPassword, constantTimeEqual } from "./demo-password";

describe("constantTimeEqual", () => {
  it("returns true for identical strings", async () => {
    await expect(constantTimeEqual("hello", "hello")).resolves.toBe(true);
    await expect(constantTimeEqual("", "")).resolves.toBe(true);
  });

  it("returns false for differing strings of equal length", async () => {
    await expect(constantTimeEqual("hello", "world")).resolves.toBe(false);
  });

  it("returns false for differing lengths", async () => {
    await expect(constantTimeEqual("a", "ab")).resolves.toBe(false);
    await expect(constantTimeEqual("abc", "")).resolves.toBe(false);
  });
});

describe("checkDemoPassword", () => {
  const original = process.env.DEMO_AUTH_PASSWORD;

  beforeEach(() => {
    delete process.env.DEMO_AUTH_PASSWORD;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.DEMO_AUTH_PASSWORD;
    else process.env.DEMO_AUTH_PASSWORD = original;
  });

  it("returns false when DEMO_AUTH_PASSWORD is unset", async () => {
    await expect(checkDemoPassword("anything")).resolves.toBe(false);
  });

  it("returns false when DEMO_AUTH_PASSWORD is empty", async () => {
    process.env.DEMO_AUTH_PASSWORD = "";
    await expect(checkDemoPassword("anything")).resolves.toBe(false);
  });

  it("returns true on exact match", async () => {
    process.env.DEMO_AUTH_PASSWORD = "shared-demo-pw-9f8a";
    await expect(checkDemoPassword("shared-demo-pw-9f8a")).resolves.toBe(true);
  });

  it("returns false on mismatch", async () => {
    process.env.DEMO_AUTH_PASSWORD = "shared-demo-pw-9f8a";
    await expect(checkDemoPassword("wrong")).resolves.toBe(false);
    await expect(checkDemoPassword("shared-demo-pw-9f8b")).resolves.toBe(false);
  });
});
