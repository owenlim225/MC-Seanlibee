import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const HASH_PREFIX = "scrypt";

function toBase64Url(value: Buffer): string {
  return value.toString("base64url");
}

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(plainPassword, salt, KEY_LENGTH, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
  });

  return [
    HASH_PREFIX,
    String(SCRYPT_COST),
    String(SCRYPT_BLOCK_SIZE),
    String(SCRYPT_PARALLELIZATION),
    toBase64Url(salt),
    toBase64Url(hash),
  ].join("$");
}

export function isPasswordHash(value: string): boolean {
  return value.startsWith(`${HASH_PREFIX}$`);
}

export function verifyPassword(plainPassword: string, storedPassword: string): boolean {
  try {
    const parts = storedPassword.split("$");
    if (parts.length !== 6 || parts[0] !== HASH_PREFIX) return false;

    const [, cost, blockSize, parallelization, saltBase64, hashBase64] = parts;
    if (!cost || !blockSize || !parallelization || !saltBase64 || !hashBase64) return false;

    const N = Number(cost);
    const r = Number(blockSize);
    const p = Number(parallelization);
    if (N !== SCRYPT_COST || r !== SCRYPT_BLOCK_SIZE || p !== SCRYPT_PARALLELIZATION) return false;

    const salt = Buffer.from(saltBase64, "base64url");
    const expectedHash = Buffer.from(hashBase64, "base64url");
    if (salt.length === 0 || expectedHash.length !== KEY_LENGTH) return false;

    const computedHash = scryptSync(plainPassword, salt, expectedHash.length, { N, r, p });
    return timingSafeEqual(expectedHash, computedHash);
  } catch {
    return false;
  }
}
