import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prefer local developer overrides, then fallback defaults.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
