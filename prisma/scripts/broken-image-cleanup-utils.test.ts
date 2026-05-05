import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseBrokenImageUrlsFromLog,
  partitionMatchedSeededItemsByProtection,
  selectMatchedSeededMenuItems,
  type MatchedMenuItem,
} from "./broken-image-cleanup-utils";

describe("parseBrokenImageUrlsFromLog", () => {
  it("parses only configured line range and deduplicates URLs", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "broken-image-logs-"));
    const logPath = path.join(tempDir, "terminal.txt");
    const lines = [
      "ignored before range",
      "ignored before range",
      "upstream image response failed for https://cdn.example.com/a.jpg?x=1 404",
      "upstream image response failed for https://cdn.example.com/a.jpg?x=1 404",
      "upstream image response failed for https://cdn.example.com/b.jpg?x=2",
      "404",
      "unrelated",
    ];
    await writeFile(logPath, lines.join("\n"), "utf8");

    const parsed = await parseBrokenImageUrlsFromLog({
      logPath,
      startLine: 3,
      endLine: 6,
      execute: false,
      reportDir: "reports/menu-image-cleanup",
    });

    expect(parsed.parsedUrlCount).toBe(3);
    expect(parsed.uniqueUrls).toEqual([
      "https://cdn.example.com/a.jpg?x=1",
      "https://cdn.example.com/b.jpg?x=2",
    ]);
    expect(parsed.unmatchedLogLines).toEqual([]);

    await rm(tempDir, { recursive: true, force: true });
  });

  it("extracts unique broken URLs from terminal-style lines in range", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "broken-image-logs-"));
    const logPath = path.join(tempDir, "terminal.txt");
    const lines = [
      "L115:outside range",
      "L116:⨯ upstream image response failed for https://goldbelly.imgix.net/a.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1 404",
      "L117:⨯ upstream image response failed for https://goldbelly.imgix.net/a.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1 404",
      "L118:⨯ upstream image response failed for https://goldbelly.imgix.net/b.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
      'L119:⨯ upstream image response failed for https://goldbelly.imgix.net/c.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1" was detected as the Largest Contentful Paint (LCP).',
      "L120:404",
      "L121:GET /customer 200 in 50ms",
    ];
    await writeFile(logPath, lines.join("\n"), "utf8");

    const parsed = await parseBrokenImageUrlsFromLog({
      logPath,
      startLine: 2,
      endLine: 7,
      execute: false,
      reportDir: "reports/menu-image-cleanup",
    });

    expect(parsed.uniqueUrls).toEqual([
      "https://goldbelly.imgix.net/a.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
      "https://goldbelly.imgix.net/b.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
    ]);
    expect(parsed.unmatchedLogLines).toHaveLength(1);

    await rm(tempDir, { recursive: true, force: true });
  });
});

describe("seeded-item matching and deletion safeguards", () => {
  it("queries seeded ids and broken URLs only", async () => {
    const mockedItems: MatchedMenuItem[] = [
      { id: "seed-1", name: "Seeded One", imageUrl: "https://img/a.jpg" },
    ];
    const findMany = async (args: unknown) => {
      expect(args).toEqual({
        where: {
          id: { in: ["seed-1", "seed-2"] },
          imageUrl: { in: ["https://img/a.jpg", "https://img/b.jpg"] },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      });
      return mockedItems;
    };

    const prisma = { menuItem: { findMany } } as Parameters<typeof selectMatchedSeededMenuItems>[0];
    const result = await selectMatchedSeededMenuItems(
      prisma,
      ["https://img/a.jpg", "https://img/b.jpg"],
      new Set(["seed-1", "seed-2"]),
    );

    expect(result).toEqual(mockedItems);
  });

  it("keeps order-linked seeded items protected from deletion", () => {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b86323" }, body: JSON.stringify({ sessionId: "b86323", runId: "pre-fix", hypothesisId: "H4", location: "broken-image-cleanup-utils.test.ts:keeps order-linked seeded items protected from deletion", message: "import type check", data: { partitionType: typeof partitionMatchedSeededItemsByProtection }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    const matchedIds = ["seed-1", "seed-2", "seed-3"];
    const partitioned = partitionMatchedSeededItemsByProtection(matchedIds, ["seed-2", "seed-2", "seed-9"]);

    expect(partitioned.protectedIds).toEqual(["seed-2"]);
    expect(partitioned.deletableIds).toEqual(["seed-1", "seed-3"]);
  });
});
