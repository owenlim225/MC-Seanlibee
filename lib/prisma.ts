import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { PrismaClient } from "@prisma/client";

// #region agent log
try {
  const rootDefault = join(process.cwd(), "node_modules", ".prisma", "client", "default.js");
  const looksLikeStub =
    existsSync(rootDefault) &&
    readFileSync(rootDefault, "utf8").includes("did not initialize yet");
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a672c2" },
    body: JSON.stringify({
      sessionId: "a672c2",
      location: "lib/prisma.ts:probe",
      message: "Prisma client resolution probe",
      data: {
        hypothesisId: "H1",
        rootDefaultExists: existsSync(rootDefault),
        rootDefaultLooksLikeStub: looksLikeStub,
      },
      timestamp: Date.now(),
      runId: "post-fix",
    }),
  }).catch(() => {});
} catch {
  /* probe must never break prisma init */
}
// #endregion

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
