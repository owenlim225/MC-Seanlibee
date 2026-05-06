import { describe, expect, it } from "vitest";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes passwords using scrypt format", () => {
    const hashed = hashPassword("S3cure-Pw-123");
    expect(isPasswordHash(hashed)).toBe(true);
    expect(hashed.startsWith("scrypt$")).toBe(true);
  });

  it("verifies matching password and rejects mismatches", () => {
    const hashed = hashPassword("S3cure-Pw-123");
    expect(verifyPassword("S3cure-Pw-123", hashed)).toBe(true);
    expect(verifyPassword("wrong-password", hashed)).toBe(false);
  });

  it("rejects malformed hashes", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "scrypt$bad$format")).toBe(false);
  });
});
