import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

// Actual Cloudflare handler and actual SQLite statements, with no server, network or persistent DB.
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../functions/api/[[path]].js", import.meta.url))],
  bundle: true, write: false, platform: "node", format: "esm",
});
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const migration = readFileSync(new URL("../migrations/0001_feedback.sql", import.meta.url), "utf8");
const origin = "https://contract.invalid";

function d1(t, concurrentReads = 0) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(migration);
  t.after(() => sqlite.close());
  const readers = [];
  return {
    sqlite,
    rows: () => sqlite.prepare("SELECT * FROM feedback ORDER BY id").all(),
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...values) {
          return {
            async all() {
              const results = statement.all(...values);
              // If a future regression splits COUNT from INSERT, force simultaneous stale reads.
              if (concurrentReads && /SELECT COUNT/i.test(sql)) {
                await new Promise((resolve) => {
                  readers.push(resolve);
                  if (readers.length === concurrentReads) readers.forEach((release) => release());
                });
              }
              return { success: true, results };
            },
            async run() {
              await Promise.resolve();
              const result = statement.run(...values);
              return { success: true, meta: { changes: Number(result.changes) } };
            },
          };
        },
      };
    },
  };
}

async function call(path, { body, headers = {}, env = {}, method, raw } = {}) {
  const request = new Request(`${origin}/api/${path}`, {
    method: method ?? (body !== undefined || raw !== undefined ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "192.0.2.1", ...headers },
    ...(raw !== undefined ? { body: raw, ...(raw instanceof ReadableStream ? { duplex: "half" } : {}) }
      : body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const response = await onRequest({ request, env, params: { path: path.split("/") } });
  const text = await response.text();
  return { status: response.status, headers: response.headers, data: text ? JSON.parse(text) : null };
}

const rating = { type: "rating", rating: 5, loadedAt: Date.now() - 5000, toolSlug: "/cases/1", url: `${origin}/cases/1` };

test("real UI rating and feedback payloads preserve page and avoid counting notes as another rating", async (t) => {
  const db = d1(t);
  assert.equal((await call("feedback", { body: rating, env: { FEEDBACK_DB: db } })).status, 200);
  const payload = { ...rating, type: "feedback", rating: 3, issueType: "資料有誤", message: "需要補充來源", role: "醫師/醫療人員", email: "example@example.test" };
  assert.equal((await call("feedback", { body: payload, env: { FEEDBACK_DB: db } })).status, 200);
  const rows = db.rows();
  assert.equal(rows[0].type, "rating");
  assert.equal(rows[0].rating, 5);
  assert.equal(rows[0].page, "/cases/1");
  assert.match(rows[0].ip_hash, /^[0-9a-f]{16}$/);
  assert.equal(rows[1].type, "issue");
  assert.equal(rows[1].rating, null);
  assert.equal(rows[1].page, "/cases/1");
  const detail = JSON.parse(rows[1].message);
  assert.equal(detail.格式, "feedback-v1");
  assert.equal(detail.回饋類型, "feedback");
  assert.equal(detail.評分, 3);
  assert.equal(detail.問題類型, payload.issueType);
  assert.equal(detail.使用回饋, payload.message);
  assert.equal(detail.填寫者身分, payload.role);
  assert.equal(detail.回覆聯絡信箱, payload.email);
});

test("real UI error reports retain intentional detail, sources, contact and snapshot in existing message column", async (t) => {
  const db = d1(t);
  const payload = {
    ...rating, type: "error", rating: undefined, errorType: "案例資料錯誤",
    description: '來源與判決不一致\n「原文」需要確認', suggestion: "請核對官方來源",
    refs: "https://reference.invalid/source", role: "一般民眾", email: "example@example.test",
    viewport: "390x844", resultSnapshot: "標題：案例\nH1：選手\nURL：https://contract.invalid/cases/1",
  };
  const result = await call("feedback", { body: payload, env: { FEEDBACK_DB: db } });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("Cache-Control"), "no-store");
  const row = db.rows()[0];
  const detail = JSON.parse(row.message);
  assert.equal(row.type, "issue");
  assert.equal(row.rating, null);
  for (const [key, label] of Object.entries({ errorType: "錯誤類型", description: "問題描述", suggestion: "建議內容", refs: "參考來源", role: "填寫者身分", email: "回覆聯絡信箱", viewport: "視窗大小", resultSnapshot: "頁面快照", url: "頁面網址" })) {
    assert.equal(detail[label], payload[key], key);
  }
  assert.equal(detail.回饋類型, "error");
});

test("legacy issue payload remains supported and oversized optional fields are bounded", async (t) => {
  const db = d1(t);
  const result = await call("feedback", { body: { type: "issue", message: "legacy report", page: "/legacy", refs: "a".repeat(1000) }, env: { FEEDBACK_DB: db } });
  assert.equal(result.status, 200);
  assert.equal(db.rows()[0].page, "/legacy");
  assert.equal(JSON.parse(db.rows()[0].message).參考來源.length, 500);
});

test("invalid feedback types, ratings, error details, field types and emails never write", async (t) => {
  const db = d1(t);
  for (const body of [
    { type: "rating", rating: 0 }, { type: "rating", rating: "5" }, { type: "unknown", rating: 5 },
    { type: "error", errorType: "資料有誤" }, { type: "error", description: "missing type" },
    { type: "issue", message: "   " }, { type: "feedback", message: {} }, { type: "feedback", email: "invalid" },
  ]) {
    assert.equal((await call("feedback", { body, env: { FEEDBACK_DB: db } })).status, 400);
  }
  assert.equal(db.rows().length, 0);
});

test("missing, failed or unconfirmed D1 writes return 503 instead of delivery success", async (t) => {
  t.mock.method(console, "warn", () => {});
  t.mock.method(console, "error", () => {});
  const failures = [
    {},
    { FEEDBACK_DB: { prepare() { throw new Error("simulated outage"); } } },
    { FEEDBACK_DB: { prepare() { return { bind() { return { async run() { return { success: false }; } }; } }; } } },
    { FEEDBACK_DB: { prepare() { return { bind() { return { async run() { return { success: true }; } }; } }; } } },
  ];
  for (const env of failures) {
    const result = await call("feedback", { body: rating, env });
    assert.equal(result.status, 503);
    assert.equal(result.data.ok, undefined);
    assert.match(result.data.error, /尚未送達/);
    assert.equal(result.headers.get("Cache-Control"), "no-store");
  }
});

test("feedback rejects cross-origin and text/plain writes, allowing same-origin JSON and originless API clients", async (t) => {
  const db = d1(t);
  for (const headers of [{ Origin: "https://other.invalid" }, { Origin: "null" }, { "Sec-Fetch-Site": "cross-site" }]) {
    assert.equal((await call("feedback", { body: rating, headers, env: { FEEDBACK_DB: db } })).status, 403);
  }
  assert.equal((await call("feedback", { body: rating, headers: { "Content-Type": "text/plain" }, env: { FEEDBACK_DB: db } })).status, 415);
  assert.equal(db.rows().length, 0);
  for (const headers of [{ Origin: origin, "Sec-Fetch-Site": "same-origin" }, {}]) {
    assert.equal((await call("feedback", { body: rating, headers, env: { FEEDBACK_DB: db } })).status, 200);
  }
  assert.equal(db.rows().length, 2);
});

test("one atomic SQLite statement enforces ten writes under twenty-five concurrent requests", { timeout: 5000 }, async (t) => {
  const db = d1(t, 25);
  const results = await Promise.all(Array.from({ length: 25 }, () => call("feedback", { body: rating, env: { FEEDBACK_DB: db } })));
  assert.equal(results.filter((r) => r.status === 200).length, 10);
  assert.equal(results.filter((r) => r.status === 429).length, 15);
  assert.equal(db.rows().length, 10);
  for (const result of results.filter((r) => r.status === 429)) {
    assert.equal(result.data.ok, undefined);
    assert.ok(Number(result.headers.get("Retry-After")) > 0);
  }
  assert.equal((await call("feedback", { body: rating, headers: { "CF-Connecting-IP": "192.0.2.2" }, env: { FEEDBACK_DB: db } })).status, 200);
  db.sqlite.prepare("UPDATE feedback SET created_at = ?").run(Date.now() - 3600_001);
  assert.equal((await call("feedback", { body: rating, env: { FEEDBACK_DB: db } })).status, 200);
});

test("honeypot does not write; too-early real submissions return a retryable error", async (t) => {
  const db = d1(t);
  assert.equal((await call("feedback", { body: { ...rating, website: "bot" }, env: { FEEDBACK_DB: db } })).status, 200);
  assert.equal((await call("feedback", { body: { ...rating, loadedAt: Date.now() }, env: { FEEDBACK_DB: db } })).status, 429);
  assert.equal(db.rows().length, 0);
});

test("all JSON callers reject malformed/nonobject input and UTF-8 bodies over 32 KiB consistently", async () => {
  for (const path of ["feedback", "tue/check", "education/quizzes/1/answer"]) {
    for (const raw of ["{", "null", "[]", "5"]) {
      assert.equal((await call(path, { raw })).status, 400, `${path} ${raw}`);
    }
    assert.equal((await call(path, { raw: "{}", headers: { "Content-Type": "text/plain" } })).status, 415);
    const raw = JSON.stringify({ message: "中".repeat(20000) });
    assert.ok(raw.length < 32768 && Buffer.byteLength(raw) > 32768);
    for (const headers of [{}, { "Content-Length": "1" }]) {
      const result = await call(path, { raw, headers });
      assert.equal(result.status, 413, path);
      assert.equal(result.headers.get("Cache-Control"), "no-store");
    }
  }
});

test("parser accepts exactly 32 KiB and multibyte characters across stream chunks", async () => {
  const base = JSON.stringify({ drugName: "未知藥物", padding: "" });
  const exact = JSON.stringify({ drugName: "未知藥物", padding: "x".repeat(32768 - Buffer.byteLength(base)) });
  assert.equal(Buffer.byteLength(exact), 32768);
  const bytes = new TextEncoder().encode(exact);
  let index = 0;
  const raw = new ReadableStream({ pull(controller) {
    if (index === bytes.length) return controller.close();
    controller.enqueue(bytes.slice(index, ++index));
  } });
  assert.equal((await call("tue/check", { raw })).status, 200);
  assert.equal((await call("tue/check", { raw: exact + " " })).status, 413);
});

test("over-limit streams are cancelled before reading the rest, including declared oversized bodies", async () => {
  for (const declared of [false, true]) {
    let pulls = 0;
    let cancelled = false;
    const raw = new ReadableStream({
      pull(controller) { pulls++; controller.enqueue(new Uint8Array(8192)); },
      cancel() { cancelled = true; },
    }, { highWaterMark: 0 });
    const result = await call("tue/check", { raw, headers: declared ? { "Content-Length": "999999" } : {} });
    assert.equal(result.status, 413);
    assert.equal(cancelled, true);
    assert.equal(pulls, declared ? 0 : 5);
  }
});

test("prototype names are never routes, articles or TUE matches; ordinary contracts still work", async () => {
  for (const key of ["__proto__", "constructor", "hasOwnProperty", "toString"]) {
    assert.equal((await call(`stats/${key}`)).status, 404);
    assert.equal((await call(`education/articles/${key}`)).status, 404);
    const result = await call("tue/check", { body: { drugName: key } });
    assert.equal(result.status, 200);
    assert.equal(result.data.matchedKey, null);
    assert.equal(result.data.needsTUE, null);
    assert.equal(result.data.wadaCategory, "未知");
  }
  assert.equal((await call("stats/review-summary")).status, 200);
  assert.equal((await call("stats/overview")).data.totalCases, 517);
  assert.equal((await call("education/quizzes/1/answer", { body: { answer: 1 } })).data.correct, true);
  assert.equal((await call("education/quizzes/1/answer", { body: {} })).status, 400);
  assert.equal((await call("tue/check", { body: { drugName: "prednisolone" } })).data.matchedKey, "prednisolone");
});
