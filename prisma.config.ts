import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";
import fs from "node:fs";
import path from "node:path";

// Prefer local developer overrides, then fallback defaults.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const prismaEnginePath = path.join(
  process.cwd(),
  "node_modules",
  ".pnpm",
  "@prisma+client@6.19.0_prism_0ade0c2032e7f19289902b884120cfab",
  "node_modules",
  ".prisma",
  "client",
  "query_engine-windows.dll.node",
);

// #region agent log
fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
  body: JSON.stringify({
    sessionId: "b370d7",
    runId: "pre-fix",
    hypothesisId: "H1",
    location: "prisma.config.ts:env-load",
    message: "Prisma config loaded for db push execution",
    data: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      cwd: process.cwd(),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
  body: JSON.stringify({
    sessionId: "b370d7",
    runId: "pre-fix",
    hypothesisId: "H2",
    location: "prisma.config.ts:engine-path-check",
    message: "Engine DLL existence and metadata before prisma command",
    data: {
      enginePath: prismaEnginePath,
      exists: fs.existsSync(prismaEnginePath),
      size: fs.existsSync(prismaEnginePath) ? fs.statSync(prismaEnginePath).size : null,
      readonly: fs.existsSync(prismaEnginePath) ? Boolean(fs.statSync(prismaEnginePath).mode & 0o200) === false : null,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

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
