import fs from "node:fs";
import path from "node:path";

const prismaDir = path.join(process.cwd(), "prisma");
const manifestPath = path.join(prismaDir, "seed-sources", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function isValidFoodRow(row) {
  return (
    row &&
    typeof row === "object" &&
    typeof row.id === "string" &&
    typeof row.img === "string" &&
    typeof row.name === "string" &&
    typeof row.dsc === "string" &&
    typeof row.price === "number" &&
    typeof row.rate === "number" &&
    typeof row.country === "string"
  );
}

/** @type {Map<string, string[]>} */
const urlRefs = new Map();
const seenIds = new Set();
/** @type {Array<{sourceSlug: string; rowIndex: number; reason: string}>} */
const invalidRows = [];
/** @type {Map<string, string[]>} */
const duplicateIdRefs = new Map();
/** @type {Map<string, string>} */
const firstIdRef = new Map();

for (const entry of manifest) {
  const sourcePath = path.resolve(path.join(prismaDir, "seed-sources"), entry.filePath);
  const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(`Seed source must be an array: ${entry.sourceSlug} (${sourcePath})`);
  }

  for (const [rowIndex, row] of data.entries()) {
    if (!isValidFoodRow(row)) {
      invalidRows.push({ sourceSlug: entry.sourceSlug, rowIndex, reason: "Invalid FoodRow shape" });
      continue;
    }

    const rowRef = `${entry.sourceSlug}[${rowIndex}]`;
    if (seenIds.has(row.id)) {
      const refs = duplicateIdRefs.get(row.id) ?? [];
      if (refs.length === 0) {
        const firstRef = firstIdRef.get(row.id);
        if (firstRef) refs.push(firstRef);
      }
      refs.push(rowRef);
      duplicateIdRefs.set(row.id, refs);
    } else {
      seenIds.add(row.id);
      firstIdRef.set(row.id, rowRef);
    }

    if (!row.img) continue;
    const refs = urlRefs.get(row.img) ?? [];
    refs.push(`${entry.sourceSlug}#${row.id}`);
    urlRefs.set(row.img, refs);
  }
}

async function probe(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 20000);
  try {
    let r = await fetch(url, {
      method: "HEAD",
      signal: ac.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FoodImageProbe/1.0)" },
    });
    clearTimeout(t);
    if (r.status === 405 || r.status === 501) {
      const ac2 = new AbortController();
      const t2 = setTimeout(() => ac2.abort(), 20000);
      r = await fetch(url, {
        method: "GET",
        signal: ac2.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoodImageProbe/1.0)",
          Range: "bytes=0-8191",
        },
      });
      clearTimeout(t2);
    }
    const ctFinal = r.headers.get("content-type") ?? "";
    const ok = r.ok && ctFinal.startsWith("image/");
    return { ok, status: r.status, contentType: ctFinal };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, error: String(/** @type {Error} */ (e).message ?? e) };
  }
}

const urls = [...urlRefs.keys()];
let checked = 0;
const bad = [];
for (const url of urls) {
  const res = await probe(url);
  checked += 1;
  if (!res.ok) {
    bad.push({ url, ...res, refs: urlRefs.get(url) });
  }
  if (checked % 40 === 0) {
    process.stderr.write(`checked ${checked}/${urls.length}\n`);
  }
}

const duplicateIds = [...duplicateIdRefs.entries()].map(([id, refs]) => ({ id, refs }));
const hasValidationErrors = invalidRows.length > 0;
console.log(
  JSON.stringify(
    {
      totalSources: manifest.length,
      totalUniqueIds: seenIds.size,
      invalidRowCount: invalidRows.length,
      duplicateIdCount: duplicateIds.length,
      totalUrls: urls.length,
      badCount: bad.length,
      invalidRows,
      duplicateIds,
      bad,
    },
    null,
    2,
  ),
);

if (hasValidationErrors) {
  process.exit(1);
}
