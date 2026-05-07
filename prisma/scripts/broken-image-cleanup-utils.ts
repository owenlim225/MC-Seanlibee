import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sourceManifest from "../seed-sources/manifest.json";
import bbqs from "../data/bbqs.json";
import breads from "../data/breads.json";
import burgers from "../data/burgers.json";
import chocolates from "../data/chocolates.json";
import desserts from "../data/desserts.json";
import drinks from "../data/drinks.json";
import friedChicken from "../data/fried-chicken.json";
import iceCream from "../data/ice-cream.json";
import pizzas from "../data/pizzas.json";
import porks from "../data/porks.json";
import sandwiches from "../data/sandwiches.json";
import sausages from "../data/sausages.json";
import steaks from "../data/steaks.json";

type ApprovedSourceSlug =
  | "bbqs"
  | "breads"
  | "burgers"
  | "chocolates"
  | "desserts"
  | "drinks"
  | "fried-chicken"
  | "ice-cream"
  | "pizzas"
  | "porks"
  | "sandwiches"
  | "sausages"
  | "steaks";

type FoodRow = {
  id: string;
  img: string;
};

type ManifestEntry = {
  sourceSlug: ApprovedSourceSlug;
  filePath: string;
};

const SOURCE_ROWS_BY_SLUG: Record<ApprovedSourceSlug, unknown> = {
  bbqs,
  breads,
  burgers,
  chocolates,
  desserts,
  drinks,
  "fried-chicken": friedChicken,
  "ice-cream": iceCream,
  pizzas,
  porks,
  sandwiches,
  sausages,
  steaks,
};

export type CleanupCliOptions = {
  logPath: string;
  startLine: number;
  endLine: number;
  execute: boolean;
  reportDir: string;
};

export type ParsedLogData = {
  requestedStartLine: number;
  requestedEndLine: number;
  actualStartLine: number;
  actualEndLine: number;
  totalLinesInFile: number;
  parsedUrlCount: number;
  uniqueUrls: string[];
  unmatchedLogLines: string[];
};

export type MatchedMenuItem = {
  id: string;
  name: string;
  imageUrl: string;
};

export type SeededItemProtectionPartition = {
  protectedIds: string[];
  deletableIds: string[];
};

export type CleanupReport = {
  mode: "dry-run" | "execute";
  timestamp: string;
  input: {
    logPath: string;
    lineRange: { start: number; end: number };
    actualRange: { start: number; end: number };
    totalLinesInFile: number;
    reportPath: string;
  };
  counts: {
    parsed: number;
    unique: number;
    matched: number;
    deleted: number;
    skipped: number;
    unresolved: number;
  };
  urls: {
    unique: string[];
    unresolved: string[];
    unmatchedFromLogs: string[];
  };
  matches: MatchedMenuItem[];
  skippedItemIds: string[];
};

function parseIntegerArg(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Expected positive integer argument, received "${raw}"`);
  }
  return parsed;
}

export function parseCliOptions(argv: string[]): CleanupCliOptions {
  const options: CleanupCliOptions = {
    logPath: "",
    startLine: 116,
    endLine: 443,
    execute: false,
    reportDir: path.join("reports", "menu-image-cleanup"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--execute") {
      options.execute = true;
      continue;
    }
    if (token === "--log-path") {
      options.logPath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--start-line") {
      options.startLine = parseIntegerArg(argv[i + 1], options.startLine);
      i += 1;
      continue;
    }
    if (token === "--end-line") {
      options.endLine = parseIntegerArg(argv[i + 1], options.endLine);
      i += 1;
      continue;
    }
    if (token === "--report-dir") {
      options.reportDir = argv[i + 1] ?? options.reportDir;
      i += 1;
      continue;
    }
  }

  if (options.logPath.trim().length === 0) {
    throw new Error("Missing required --log-path");
  }
  if (options.startLine > options.endLine) {
    throw new Error("--start-line cannot be greater than --end-line");
  }
  return options;
}

export function normalizeUrl(url: string): string {
  return url.trim();
}

export async function parseBrokenImageUrlsFromLog(options: CleanupCliOptions): Promise<ParsedLogData> {
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b86323" }, body: JSON.stringify({ sessionId: "b86323", runId: "pre-fix", hypothesisId: "H1", location: "broken-image-cleanup-utils.ts:parseBrokenImageUrlsFromLog:start", message: "parse invoked", data: { logPath: options.logPath, startLine: options.startLine, endLine: options.endLine }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
  const raw = await readFile(options.logPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const actualStartLine = Math.min(options.startLine, Math.max(lines.length, 1));
  const actualEndLine = Math.min(options.endLine, lines.length);
  const sliced = lines.slice(actualStartLine - 1, actualEndLine);

  const urls: string[] = [];
  const unmatchedLogLines: string[] = [];
  const pattern = /upstream image response failed for\s+(https?:\/\/\S+?)(?:\s+404)?\s*$/i;

  for (const rawLine of sliced) {
    const line = rawLine.replace(/^L\d+:/, "").trim();
    if (!line.includes("upstream image response failed for")) {
      continue;
    }
    const match = line.match(pattern);
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b86323" }, body: JSON.stringify({ sessionId: "b86323", runId: "pre-fix", hypothesisId: "H2", location: "broken-image-cleanup-utils.ts:parseBrokenImageUrlsFromLog:line", message: "line parse attempt", data: { line, matched: Boolean(match), matchedUrl: match?.[1] ?? null }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    if (!match) {
      unmatchedLogLines.push(line);
      continue;
    }
    const normalized = normalizeUrl(match[1] ?? "");
    if (normalized.length > 0) {
      urls.push(normalized);
    } else {
      unmatchedLogLines.push(line);
    }
  }

  const uniqueUrls = [...new Set(urls)];
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b86323" }, body: JSON.stringify({ sessionId: "b86323", runId: "pre-fix", hypothesisId: "H3", location: "broken-image-cleanup-utils.ts:parseBrokenImageUrlsFromLog:result", message: "parse result summary", data: { parsedUrlCount: urls.length, uniqueUrls, unmatchedCount: unmatchedLogLines.length, actualStartLine, actualEndLine, totalLinesInFile: lines.length }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
  return {
    requestedStartLine: options.startLine,
    requestedEndLine: options.endLine,
    actualStartLine,
    actualEndLine,
    totalLinesInFile: lines.length,
    parsedUrlCount: urls.length,
    uniqueUrls,
    unmatchedLogLines,
  };
}

function isFoodRow(value: unknown): value is FoodRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.img === "string";
}

function parseSourceRows(rows: unknown, sourceSlug: string): FoodRow[] {
  if (!Array.isArray(rows)) {
    throw new Error(`Expected array rows for source "${sourceSlug}"`);
  }
  return rows.map((row, index) => {
    if (!isFoodRow(row)) {
      throw new Error(`Invalid row at source "${sourceSlug}" index ${index}`);
    }
    return row;
  });
}

export function getSeededMenuItemIds(): Set<string> {
  const manifest = sourceManifest as ManifestEntry[];
  const seededIds = new Set<string>();

  for (const entry of manifest) {
    const sourceRows = parseSourceRows(SOURCE_ROWS_BY_SLUG[entry.sourceSlug], entry.sourceSlug);
    const limitedRows = sourceRows.slice(0, 20);
    for (const row of limitedRows) {
      seededIds.add(row.id);
    }
  }
  return seededIds;
}

export async function writeCleanupReport(
  reportDir: string,
  mode: "dry-run" | "execute",
  report: CleanupReport,
): Promise<string> {
  await mkdir(reportDir, { recursive: true });
  const fileName = `broken-image-cleanup-${mode}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const reportPath = path.join(reportDir, fileName);
  const reportWithPath: CleanupReport = {
    ...report,
    input: {
      ...report.input,
      reportPath,
    },
  };
  await writeFile(reportPath, JSON.stringify(reportWithPath, null, 2), "utf8");
  return reportPath;
}

export async function selectMatchedSeededMenuItems(
  prisma: PrismaClient,
  uniqueUrls: string[],
  seededIds: Set<string>,
): Promise<MatchedMenuItem[]> {
  if (uniqueUrls.length === 0 || seededIds.size === 0) return [];
  return prisma.menuItem.findMany({
    where: {
      id: { in: [...seededIds] },
      imageUrl: { in: uniqueUrls },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  }) as Promise<MatchedMenuItem[]>;
}

export function partitionMatchedSeededItemsByProtection(
  matchedIds: string[],
  protectedMenuItemIds: Iterable<string>,
): SeededItemProtectionPartition {
  const protectedSet = new Set(protectedMenuItemIds);
  const protectedIds = matchedIds.filter((id) => protectedSet.has(id));
  const deletableIds = matchedIds.filter((id) => !protectedSet.has(id));
  return { protectedIds, deletableIds };
}
