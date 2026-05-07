import fs from "node:fs";
import path from "node:path";

const prismaDir = path.join(process.cwd(), "prisma", "data");
const files = fs
  .readdirSync(prismaDir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("package"));

if (files.length === 0) {
  process.stderr.write(`ERROR: No JSON files found in ${prismaDir}\n`);
  process.exit(1);
}

/** @type {Map<string, string[]>} */
const urlRefs = new Map();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(prismaDir, f), "utf8"));
  for (const row of data) {
    if (!row.img) continue;
    const refs = urlRefs.get(row.img) ?? [];
    refs.push(`${f}#${row.id}`);
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

console.log(JSON.stringify({ totalUrls: urls.length, badCount: bad.length, bad }, null, 2));
