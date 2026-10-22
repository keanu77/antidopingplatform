import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../functions/api/[[path]].js", import.meta.url))],
  bundle: true, write: false, platform: "node", format: "esm",
});
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

test("100 valid large UTF-8 reports drain in byte-bounded batches without skipping rows", async (t) => {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  for (const name of readdirSync(new URL("../migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort()) {
    sqlite.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  }
  const storedBatches = [];
  const db = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return { bind(...values) {
        return {
          async all() { return { success: true, results: statement.all(...values) }; },
          async run() {
            if (sql.startsWith("UPDATE feedback_delivery SET pending_json")) {
              const bytes = Buffer.byteLength(values[0], "utf8");
              assert.ok(bytes <= 750_000, `Pending batch exceeds byte budget: ${bytes}`);
              const pending = JSON.parse(values[0]);
              storedBatches.push({ bytes, count: pending.count, endId: pending.endId });
            }
            const result = statement.run(...values);
            return { success: true, meta: { changes: Number(result.changes) } };
          },
        };
      } };
    },
  };
  const env = { FEEDBACK_DB: db, CRON_SECRET: "synthetic", RESEND_API_KEY: "synthetic", FEEDBACK_DIGEST_TO: "to@example.test" };
  const payload = {
    type: "error", loadedAt: 0, page: "/cases/1",
    errorType: "錯".repeat(100), description: "文".repeat(2000), suggestion: "文".repeat(1000),
    refs: "文".repeat(500), role: "文".repeat(100), email: `${"a".repeat(180)}@example.test`,
    url: `https://antidopingplatform.sportsmedicine.tw/${"a".repeat(940)}`,
  };
  assert.ok(Buffer.byteLength(JSON.stringify(payload)) < 32 * 1024);
  for (let i = 0; i < 100; i++) {
    const request = new Request("https://contract.invalid/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": `192.0.2.${i}` },
      body: JSON.stringify(payload),
    });
    const response = await onRequest({ request, env, params: { path: ["feedback"] } });
    assert.equal(response.status, 200, `Report ${i + 1} must be accepted by the actual handler`);
    assert.equal((await response.json()).ok, true);
  }
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM feedback").get().n, 100);

  let providerCalls = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    return new Response(JSON.stringify({ id: `synthetic-${++providerCalls}` }));
  });
  let delivered = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    const request = new Request("https://contract.invalid/api/cron/feedback-digest", { headers: { "x-cron-secret": "synthetic" } });
    const response = await onRequest({ request, env, params: { path: ["cron", "feedback-digest"] } });
    assert.equal(response.status, 200);
    const result = await response.json();
    if (!result.sent) break;
    delivered += result.count;
    assert.equal(sqlite.prepare("SELECT cursor_id FROM feedback_delivery").get().cursor_id, delivered);
  }
  assert.ok(storedBatches.length > 1, "Large reports must not be packed into one D1 row");
  assert.equal(providerCalls, storedBatches.length);
  assert.equal(delivered, 100);
  assert.equal(storedBatches.reduce((sum, batch) => sum + batch.count, 0), 100);
  assert.equal(storedBatches.at(-1).endId, 100);
  const state = sqlite.prepare("SELECT cursor_id, pending_json FROM feedback_delivery").get();
  assert.equal(state.cursor_id, 100);
  assert.equal(state.pending_json, null);
});
