import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ENDPOINT =
  "http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3";
const SESSION_ID = "ae7c98";

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] })
      .toString("utf8")
      .trim();
  } catch (err) {
    const stdout = err?.stdout ? String(err.stdout) : "";
    const stderr = err?.stderr ? String(err.stderr) : "";
    return `${stdout}\n${stderr}`.trim();
  }
}

function post({ runId, hypothesisId, location, message, data }) {
  // #region agent log
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

const runId = process.env.AGENT_DEBUG_RUN_ID || "pre-repro";
const cwd = process.cwd();

const posts = [];

posts.push(
  post({
  runId,
  hypothesisId: "A_versions_paths",
  location: "scripts/agent-debug/pnpm-prisma-eperm.mjs:1",
  message: "Baseline env + paths",
  data: {
    cwd,
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    pnpm: sh("pnpm -v"),
    prisma: sh("pnpm exec prisma -v"),
    nodeLinker: sh("pnpm config get node-linker"),
    pnpmStoreDir: sh("pnpm config get store-dir"),
    pnpmVirtualStoreDir: sh("pnpm config get virtual-store-dir"),
    repoDriveLetter: /^[A-Za-z]:/.test(cwd) ? cwd.slice(0, 2) : null,
    nodeModulesExists: existsSync(resolve(cwd, "node_modules")),
    pnpmVirtualStoreExists: existsSync(resolve(cwd, "node_modules", ".pnpm")),
  },
  })
);

posts.push(
  post({
  runId,
  hypothesisId: "B_locks_processes",
  location: "scripts/agent-debug/pnpm-prisma-eperm.mjs:2",
  message: "Running node-like processes snapshot",
  data: {
    processes: sh(
      'powershell -NoProfile -Command "Get-Process node,next,prisma -ErrorAction SilentlyContinue | Select-Object -First 50 Name,Id,Path | ConvertTo-Json -Compress"'
    ),
  },
  })
);

posts.push(
  post({
  runId,
  hypothesisId: "C_filesystem_o_drive",
  location: "scripts/agent-debug/pnpm-prisma-eperm.mjs:3",
  message: "Drive info for cwd",
  data: {
    volume: sh(
      'powershell -NoProfile -Command "$d=(Get-Location).Path.Substring(0,1); Get-Volume -DriveLetter $d -ErrorAction SilentlyContinue | Select-Object DriveLetter,FileSystemLabel,FileSystemType,DriveType,HealthStatus,SizeRemaining,Size | ConvertTo-Json -Compress"'
    ),
  },
  })
);

await Promise.all(posts);

console.log("agent-debug ok");
