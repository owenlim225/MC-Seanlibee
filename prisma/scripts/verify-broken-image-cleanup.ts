import { PrismaClient } from "@prisma/client";
import {
  getSeededMenuItemIds,
  parseBrokenImageUrlsFromLog,
  parseCliOptions,
  selectMatchedSeededMenuItems,
} from "./broken-image-cleanup-utils";

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const parsed = await parseBrokenImageUrlsFromLog(options);
    const seededIds = getSeededMenuItemIds();
    const matches = await selectMatchedSeededMenuItems(prisma, parsed.uniqueUrls, seededIds);

    console.log(`[verify] logPath=${options.logPath}`);
    console.log(`[verify] range=${parsed.actualStartLine}-${parsed.actualEndLine}`);
    console.log(`[verify] uniqueBrokenUrls=${parsed.uniqueUrls.length}`);
    console.log(`[verify] matchingSeededItems=${matches.length}`);

    if (matches.length > 0) {
      for (const item of matches) {
        console.log(`  - ${item.id} | ${item.name} | ${item.imageUrl}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("[verify] PASS: no seeded menu items still reference broken URLs");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[verify] failed", error);
  process.exit(1);
});
