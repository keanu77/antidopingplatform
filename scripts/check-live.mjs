// Public, read-only checks. No feedback writes, cron triggers or credentials.
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
if (!drugs.substances?.salbutamol?.s5ThresholdRule) throw new Error("Current S5 data not served");
for (const path of ["/", "/tue", "/quiz", "/prohibited-list", "/editorial-policy", "/learning"]) {
  const html = await (await get(path)).text();
  if (!/<html[^>]+lang="zh-(?:Hant|TW)"/.test(html) || !/<title>[^<]+<\/title>/.test(html)) throw new Error(`${path}: invalid HTML`);
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), site, sha: version.sha, cases: health.cases, status: "passed", mode: "read-only" }, null, 2));
