import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prefer local developer overrides, then fallback defaults.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

// #region agent log
fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "734e4c" },
  body: JSON.stringify({
    sessionId: "734e4c",
    runId: "pre-fix",
    hypothesisId: "H2",
    location: "prisma.config.ts:8",
    message: "prisma config loaded for migrate command",
    data: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasPrismaMigrationsPath: true,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "823e17" },
  body: JSON.stringify({
    sessionId: "823e17",
    runId: "pre-fix",
    hypothesisId: "E1",
    location: "prisma.config.ts:8",
    message: "prisma config env presence snapshot",
    data: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasNextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

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
