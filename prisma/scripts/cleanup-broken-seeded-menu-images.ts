import { PrismaClient } from "@prisma/client";
import {
  getSeededMenuItemIds,
  parseBrokenImageUrlsFromLog,
  parseCliOptions,
  partitionMatchedSeededItemsByProtection,
  selectMatchedSeededMenuItems,
  writeCleanupReport,
  type CleanupReport,
} from "./broken-image-cleanup-utils";

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const prisma = new PrismaClient();
  const mode: "dry-run" | "execute" = options.execute ? "execute" : "dry-run";

  console.log(`[cleanup] mode=${mode}`);
  console.log(`[cleanup] logPath=${options.logPath}`);
  console.log(`[cleanup] requestedRange=${options.startLine}-${options.endLine}`);

  try {
    const parsed = await parseBrokenImageUrlsFromLog(options);
    const seededIds = getSeededMenuItemIds();
    const matchedItems = await selectMatchedSeededMenuItems(prisma, parsed.uniqueUrls, seededIds);
    const matchedIds = matchedItems.map((item) => item.id);

    const protectedOrderRows = matchedIds.length
      ? await prisma.orderItem.findMany({
          where: { menuItemId: { in: matchedIds } },
          select: { menuItemId: true },
        })
      : [];
    const { protectedIds, deletableIds } = partitionMatchedSeededItemsByProtection(
      matchedIds,
      protectedOrderRows.map((row) => row.menuItemId),
    );
    const unresolvedUrls = parsed.uniqueUrls.filter(
      (url) => !matchedItems.some((item) => item.imageUrl === url),
    );

    console.log(`[cleanup] parsed=${parsed.parsedUrlCount} unique=${parsed.uniqueUrls.length}`);
    console.log(`[cleanup] matched=${matchedItems.length} deletable=${deletableIds.length} skipped=${protectedIds.length}`);

    if (matchedItems.length > 0) {
      console.log("[cleanup] matched seeded menu items:");
      for (const item of matchedItems) {
        console.log(`  - ${item.id} | ${item.name} | ${item.imageUrl}`);
      }
    } else {
      console.log("[cleanup] no seeded menu items matched the broken URL list");
    }
    console.log(`[cleanup] total candidate delete count=${deletableIds.length}`);

    let deletedCount = 0;
    if (options.execute) {
      const deletion = await prisma.$transaction(async (tx) => {
        if (deletableIds.length === 0) {
          return { deletedMenuItems: 0 };
        }
        await tx.menuItemCategory.deleteMany({
          where: { menuItemId: { in: deletableIds } },
        });
        const deleted = await tx.menuItem.deleteMany({
          where: { id: { in: deletableIds } },
        });
        return { deletedMenuItems: deleted.count };
      });
      deletedCount = deletion.deletedMenuItems;
      console.log(`[cleanup] execute complete: deleted=${deletedCount}`);
    } else {
      console.log("[cleanup] dry-run only (pass --execute to delete)");
    }

    const baseReport: CleanupReport = {
      mode,
      timestamp: new Date().toISOString(),
      input: {
        logPath: options.logPath,
        lineRange: { start: parsed.requestedStartLine, end: parsed.requestedEndLine },
        actualRange: { start: parsed.actualStartLine, end: parsed.actualEndLine },
        totalLinesInFile: parsed.totalLinesInFile,
        reportPath: "",
      },
      counts: {
        parsed: parsed.parsedUrlCount,
        unique: parsed.uniqueUrls.length,
        matched: matchedItems.length,
        deleted: deletedCount,
        skipped: protectedIds.length,
        unresolved: unresolvedUrls.length,
      },
      urls: {
        unique: parsed.uniqueUrls,
        unresolved: unresolvedUrls,
        unmatchedFromLogs: parsed.unmatchedLogLines,
      },
      matches: matchedItems,
      skippedItemIds: protectedIds,
    };

    const reportPath = await writeCleanupReport(options.reportDir, mode, baseReport);

    console.log(`[cleanup] report written: ${reportPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[cleanup] failed", error);
  process.exit(1);
});
