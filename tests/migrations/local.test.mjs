import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const workspace = mkdtempSync(join(tmpdir(), "antidoping-migrations-"));
const names = ["0001_feedback.sql", "0002_feedback_fields.sql", "0003_feedback_delivery.sql"];
// Every invocation is pinned to --local and a new directory. No remote D1 or credentials needed.
const run = (entry, args) => spawnSync(process.execPath, [join(root, entry), ...args], {
  cwd: root, encoding: "utf8", timeout: 120000,
  env: { ...process.env, WRANGLER_SEND_METRICS: "false", WRANGLER_LOG_PATH: join(workspace, "logs") },
});
function ok(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function command(dir, sql) {
  return JSON.parse(ok(run("node_modules/wrangler/bin/wrangler.js", ["d1", "execute", "antidoping-feedback",
    "--local", "--persist-to", dir, `--command=${sql}`, "--json"]))).flatMap((r) => r.results);
}
function migrate(dir, action = "apply", extra = []) {
  return run("scripts/migrate-feedback.mjs", [action, "--local", "--persist-to", dir, ...extra]);
}
const rows = (dir) => command(dir, "SELECT * FROM feedback ORDER BY id");
const history = (dir) => command(dir, "SELECT name, applied_at FROM d1_migrations ORDER BY id");
const seed = (dir) => command(dir, "INSERT INTO feedback(type,message,page,created_at) VALUES ('issue','preserve me','/tue',123)");
const legacy = (dir, through) => {
  command(dir, names.slice(0, through).map((name) => readFileSync(join(root, "migrations", name), "utf8")).join("\n"));
  seed(dir);
};

test("real local D1: fresh install, tracked rerun and data preservation", () => {
  const dir = join(workspace, "fresh");
  ok(migrate(dir));
  seed(dir);
  const before = rows(dir), ledger = history(dir);
  assert.deepEqual(ledger.map((r) => r.name), names);
  assert.match(ok(migrate(dir)), /No pending migrations/);
  assert.deepEqual(rows(dir), before);
  assert.deepEqual(history(dir), ledger);
});

for (const through of [1, 2]) test(`real local D1: legacy 000${through}, explicit adoption, rerun`, () => {
  const dir = join(workspace, `legacy-${through}`);
  legacy(dir, through);
  const before = rows(dir);
  const rejected = migrate(dir);
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Untracked/);
  assert.deepEqual(rows(dir), before);
  assert.deepEqual(command(dir, "SELECT name FROM sqlite_master WHERE name='d1_migrations'"), []);
  const wrong = migrate(dir, "baseline", [`--through=000${through === 1 ? 2 : 1}`]);
  assert.equal(wrong.status, 1);
  assert.match(wrong.stderr, /does not match/);
  ok(migrate(dir, "baseline", [`--through=000${through}`]));
  assert.deepEqual(rows(dir), before);
  const ledger = history(dir);
  assert.deepEqual(ledger.map((r) => r.name), names.slice(0, through));
  ok(migrate(dir, "baseline", [`--through=000${through}`]));
  assert.deepEqual(history(dir), ledger);
  ok(migrate(dir));
  const after = rows(dir);
  for (const [key, value] of Object.entries(before[0])) assert.equal(after[0][key], value);
  assert.equal(after.length, before.length);
  assert.equal(after[0].snapshot, null);
  assert.deepEqual(history(dir).map((r) => r.name), names);
  assert.match(ok(migrate(dir)), /No pending migrations/);
  assert.deepEqual(rows(dir), after);
});

test("real local D1: a partial legacy 0002 cannot be silently adopted", () => {
  const dir = join(workspace, "partial");
  legacy(dir, 1);
  command(dir, "ALTER TABLE feedback ADD COLUMN issue_type TEXT");
  const before = rows(dir);
  for (const through of [1, 2]) {
    const result = migrate(dir, "baseline", [`--through=000${through}`]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not match/);
  }
  assert.deepEqual(rows(dir), before);
  assert.deepEqual(command(dir, "SELECT name FROM sqlite_master WHERE name='d1_migrations'"), []);
});
