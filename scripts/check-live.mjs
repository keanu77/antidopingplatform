// Public, read-only checks. No feedback writes, cron triggers or credentials.
import { assessLiveSubstances } from "./lib/live-evidence.mjs";
const site = process.env.SMOKE_BASE_URL || "https://antidopingplatform.sportsmedicine.tw";
const expected = process.env.EXPECTED_SHA;
async function get(path) {
  const response = await fetch(new URL(path, site), { signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}
const version = await (await get(`/version.json?ts=${Date.now()}`)).json();
if (!/^[a-f0-9]{40}$/.test(version.sha)) throw new Error("Invalid release SHA");
if (expected && version.sha !== expected) throw new Error(`Stale release: ${version.sha}, expected ${expected}`);
const health = await (await get("/api/health")).json();
if (health.status !== "ok" || !Number.isInteger(health.cases) || health.cases < 1) throw new Error("Invalid health response");
const drugs = await (await get("/api/tue/substances")).json();
const warnDays = Number.parseInt(process.env.LIVE_EXPIRY_WARN_DAYS || "30", 10);
const evidence = assessLiveSubstances(drugs, { warnDays: Number.isInteger(warnDays) ? warnDays : 30 });
for (const message of evidence.warnings) console.warn(process.env.GITHUB_ACTIONS ? `::warning title=Evidence expiring::${message}` : `WARNING: ${message}`);
if (evidence.errors.length) throw new Error(evidence.errors.join("; "));
for (const path of ["/", "/tue", "/quiz", "/prohibited-list", "/editorial-policy", "/learning"]) {
  const html = await (await get(path)).text();
  if (!/<html[^>]+lang="zh-(?:Hant|TW)"/.test(html) || !/<title>[^<]+<\/title>/.test(html)) throw new Error(`${path}: invalid HTML`);
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), site, sha: version.sha, cases: health.cases, evidence: { asOf: evidence.asOf, valid: evidence.valid, total: evidence.total, lastValidDate: evidence.lastValidDate, warnings: evidence.warnings }, status: evidence.warnings.length ? "passed_with_warnings" : "passed", mode: "read-only" }, null, 2));
