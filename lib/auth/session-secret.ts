const DEV_FALLBACK_SECRET = "dev-only-change-me-dev-only-change-me";
const MIN_SECRET_LENGTH = 32;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in production");
  }

  return DEV_FALLBACK_SECRET;
}
