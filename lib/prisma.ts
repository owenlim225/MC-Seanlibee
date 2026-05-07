import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const hasExistingPrisma = Boolean(globalForPrisma.prisma);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// #region agent log
fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "837d50" },
  body: JSON.stringify({
    sessionId: "837d50",
    runId: "pre-fix",
    hypothesisId: "H5",
    location: "lib/prisma.ts:module-init",
    message: "prisma module initialized",
    data: { nodeEnv: process.env.NODE_ENV ?? "unknown", hasExistingPrisma },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
