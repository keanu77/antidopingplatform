import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const dist = new URL("../frontend/dist/", import.meta.url);
const html = readFileSync(new URL("index.html", dist), "utf8");
const initial = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+\.(?:js|css))"/g)].map((m) => m[1].slice(1)))];
if (!initial.length) throw new Error("Missing initial assets");
const assets = readdirSync(new URL("assets/", dist)).filter((name) => /\.(?:js|css)$/.test(name)).map((name) => {
  const path = `assets/${name}`;
  const bytes = readFileSync(new URL(path, dist));
  return { path, bytes: bytes.length, gzipBytes: gzipSync(bytes).length, initial: initial.includes(path) };
});
const total = (ext) => assets.filter((a) => a.initial && a.path.endsWith(ext)).reduce((n, a) => n + a.gzipBytes, 0);
const report = { measuredAt: new Date().toISOString(), initialJsGzip: total(".js"), initialCssGzip: total(".css"), budgets: { initialJsGzip: 200000, initialCssGzip: 40000, individualChunkGzip: 300000 }, assets };
writeFileSync(new URL("build-budget.json", dist), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ initialJsGzip: report.initialJsGzip, initialCssGzip: report.initialCssGzip, assets: assets.length, kind: "build-size; not real-user CWV" }));
if (report.initialJsGzip > report.budgets.initialJsGzip || report.initialCssGzip > report.budgets.initialCssGzip || assets.some((a) => a.gzipBytes > report.budgets.individualChunkGzip)) throw new Error("Asset budget exceeded");
