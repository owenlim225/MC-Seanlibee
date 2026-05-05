import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const terminalFilePath =
  process.argv[2] ??
  "C:/Users/limos/.cursor/projects/o-Documents-GitHub-mc-seanlibee/terminals/1.txt";
const startLine = 116;
const endLine = 443;

function extractUrlFromLine(line) {
  const marker = "upstream image response failed for";
  if (!line.includes(marker)) return null;
  const markerIndex = line.indexOf(marker);
  const afterMarker = line.slice(markerIndex + marker.length).trim();
  if (!afterMarker) return null;
  const urlMatch = afterMarker.match(/https?:\/\/\S+/);
  return urlMatch ? urlMatch[0].trim() : null;
}

function normalizeUrl(url) {
  return url.trim();
}

async function loadSeedImageUrls() {
  const manifestPath = path.join(repoRoot, "prisma", "seed-sources", "manifest.json");
  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);

  const byUrl = new Map();

  for (const entry of manifest) {
    const sourceSlug = entry.sourceSlug;
    const relativeDataPath = entry.filePath;
    const absoluteDataPath = path.resolve(path.dirname(manifestPath), relativeDataPath);
    const rowsRaw = await fs.readFile(absoluteDataPath, "utf8");
    const rows = JSON.parse(rowsRaw);

    rows.forEach((row, index) => {
      if (!row || typeof row.img !== "string") return;
      const normalized = normalizeUrl(row.img);
      if (normalized.length === 0) return;
      const hit = byUrl.get(normalized) ?? [];
      hit.push({
        sourceSlug,
        filePath: path.relative(repoRoot, absoluteDataPath).replaceAll("\\", "/"),
        rowIndex: index,
        id: typeof row.id === "string" ? row.id : null,
        name: typeof row.name === "string" ? row.name : null,
      });
      byUrl.set(normalized, hit);
    });
  }

  return byUrl;
}

async function main() {
  const terminalRaw = await fs.readFile(terminalFilePath, "utf8");
  const allLines = terminalRaw.split(/\r?\n/);
  const rangeLines = allLines.slice(startLine - 1, endLine);

  const parsedUrls = [];
  const anomalyLines = [];

  for (let i = 0; i < rangeLines.length; i += 1) {
    const line = rangeLines[i] ?? "";
    const url = extractUrlFromLine(line);
    if (!url) continue;
    parsedUrls.push(normalizeUrl(url));

    const currentLineNumber = startLine + i;
    const nextLine = rangeLines[i + 1] ?? "";
    if (!line.includes(" 404") && nextLine.trim() === "404") {
      anomalyLines.push({
        line: currentLineNumber,
        type: "split-404",
        details: "404 status appears on the next line",
      });
    }
  }

  const uniqueUrls = [...new Set(parsedUrls)];
  const seedImageUrlsByUrl = await loadSeedImageUrls();

  const presentInSeededSources = [];
  const notPresentInSeededSources = [];

  for (const url of uniqueUrls) {
    const matches = seedImageUrlsByUrl.get(url);
    if (matches && matches.length > 0) {
      presentInSeededSources.push({
        url,
        matches,
      });
    } else {
      notPresentInSeededSources.push(url);
    }
  }

  const report = {
    terminal_file: terminalFilePath,
    parsed_line_range: { start: startLine, end: endLine },
    available_terminal_line_count: allLines.length,
    parsed_count: parsedUrls.length,
    unique_count: uniqueUrls.length,
    parsed_urls_with_duplicates: parsedUrls,
    unique_urls: uniqueUrls,
    present_in_seeded_source_data: presentInSeededSources,
    not_present_in_seeded_source_data: notPresentInSeededSources,
    parsing_anomalies: anomalyLines,
    generated_at: new Date().toISOString(),
  };

  const reportDir = path.join(repoRoot, "reports", "menu-image-cleanup");
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "seeded-menu-404-baseline.json");
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        reportPath,
        parsed_count: report.parsed_count,
        unique_count: report.unique_count,
        present_count: presentInSeededSources.length,
        missing_count: notPresentInSeededSources.length,
        parsing_anomalies: anomalyLines.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
