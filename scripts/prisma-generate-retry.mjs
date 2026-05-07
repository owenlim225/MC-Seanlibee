/**
 * Prisma on Windows often hits EPERM on library-engine DLL rename (locks). Repo uses
 * `engineType = "binary"` in schema; this script clears stale .tmp engines and retries.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MAX_ATTEMPTS = 10;
const PRISMA_CLI = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");

/** Sync sleep without busy-spinning the CPU (allowed for CLI tooling). */
function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isRetryable(output) {
  const t = output.toLowerCase();
  return (
    t.includes("eperm") ||
    t.includes("operation not permitted") ||
    t.includes("ebusy") ||
    t.includes("access is denied")
  );
}

/** Known Prisma engine output dirs (pnpm nested + hoisted). */
function prismaClientOutputDirs() {
  const cwd = process.cwd();
  const dirs = new Set();
  const hoisted = path.join(cwd, "node_modules", "@prisma", "client", "node_modules", ".prisma", "client");
  if (fs.existsSync(hoisted)) dirs.add(hoisted);

  const pnpmRoot = path.join(cwd, "node_modules", ".pnpm");
  if (fs.existsSync(pnpmRoot)) {
    for (const entry of fs.readdirSync(pnpmRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith("@prisma+client@")) continue;
      const dir = path.join(pnpmRoot, entry.name, "node_modules", ".prisma", "client");
      if (fs.existsSync(dir)) dirs.add(dir);
    }
  }
  return [...dirs];
}

/** Remove DLL / tmp fragments so Prisma can write fresh (fails quietly if still mapped). */
function removeStaleEngineArtifacts() {
  let unlinked = 0;
  for (const dir of prismaClientOutputDirs()) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      const full = path.join(dir, file);
      const isOldDll = file === "query_engine-windows.dll.node";
      const isTmp =
        /\.tmp\d+$/i.test(file) || (file.includes(".tmp") && (file.endsWith(".node") || file.endsWith(".exe")));
      if (!isOldDll && !isTmp) continue;
      try {
        fs.unlinkSync(full);
        unlinked += 1;
      } catch {
        // DLL may still be mapped; binary engine generate can proceed once .tmp debris is gone.
      }
    }
  }
  return unlinked;
}

function runGenerate() {
  const result = spawnSync(process.execPath, [PRISMA_CLI, "generate"], {
    cwd: process.cwd(),
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });
  const stdout = result.stdout?.toString() ?? "";
  const stderr = result.stderr?.toString() ?? "";
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  const combined = `${stdout}\n${stderr}`;
  const status = result.status ?? 1;
  return { status, combined };
}

if (!fs.existsSync(PRISMA_CLI)) {
  console.error("[prisma-generate-retry] missing Prisma CLI at", PRISMA_CLI);
  process.exit(1);
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  removeStaleEngineArtifacts();

  const { status, combined } = runGenerate();

  if (status === 0) {
    process.exit(0);
  }

  const retryable = isRetryable(combined);

  if (!retryable || attempt === MAX_ATTEMPTS) {
    if (retryable && attempt === MAX_ATTEMPTS) {
      console.error(
        "[prisma-generate-retry] Still blocked after retries. Stop processes using Prisma (e.g. `pnpm dev`, tests), then rerun `pnpm db:generate`. If needed exclude repo from AV real-time scan for `node_modules\\.pnpm`.",
      );
    }
    process.exit(status);
  }

  const delayMs = Math.min(400 * 2 ** (attempt - 1), 8000);
  console.error(
    `[prisma-generate-retry] transient failure (attempt ${attempt}/${MAX_ATTEMPTS}), waiting ${delayMs}ms`,
  );
  sleepMs(delayMs);
}

process.exit(1);
