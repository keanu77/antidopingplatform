import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { assertSchema, expectedSchema, parseArgs, planMigration, schemaQuery } from "../scripts/migrate-feedback.mjs";

const migrations = ["0001_feedback.sql", "0002_feedback_fields.sql"];
const sql = (name) => readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8");
const plan = (overrides) => planMigration({ action: "apply", applied: [], schema: [], migrations, ...overrides });

test("legacy raw 0002 rerun fails with a duplicate column and preserves existing data", () => {
  const db = new DatabaseSync(":memory:");
  try {
    migrations.forEach((name) => db.exec(sql(name)));
    db.exec("INSERT INTO feedback(type,message,created_at) VALUES ('issue','keep me',123)");
    assert.throws(() => db.exec(sql(migrations[1])), /duplicate column name: issue_type/);
    assert.equal(db.prepare("SELECT message FROM feedback").get().message, "keep me");
  } finally { db.close(); }
});

test("new, tracked and rerun databases have only pending migrations", () => {
  assert.deepEqual(plan({}), migrations);
  assert.deepEqual(plan({ applied: migrations.slice(0, 1), schema: expectedSchema(1) }), migrations.slice(1));
  assert.deepEqual(plan({ applied: migrations, schema: expectedSchema(2) }), []);
  assert.deepEqual(plan({ applied: migrations, schema: expectedSchema(2), migrations: [...migrations, "0003_next.sql"] }), ["0003_next.sql"]);
});

test("untracked installs need explicit, matching baseline; rerunning baseline is a no-op", () => {
  for (const through of [1, 2]) {
    const schema = expectedSchema(through);
    assert.throws(() => plan({ schema }), /Untracked/);
    assert.deepEqual(plan({ action: "baseline", through, schema }), migrations.slice(0, through));
    assert.deepEqual(plan({ action: "baseline", through, schema, applied: migrations.slice(0, through) }), []);
  }
  assert.deepEqual(plan({ action: "baseline", through: 2, schema: expectedSchema(2), applied: migrations.slice(0, 1) }), migrations.slice(1));
  assert.throws(() => plan({ action: "baseline", through: 2, schema: expectedSchema(1) }), /does not match/);
  assert.throws(() => plan({ action: "baseline", through: 1, schema: expectedSchema(2) }), /does not match/);
});

test("partial schemas, missing indexes, altered constraints and unexpected history fail closed", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(sql(migrations[0]));
    db.exec("ALTER TABLE feedback ADD COLUMN issue_type TEXT");
    const partial = db.prepare(schemaQuery).all();
    for (const through of [1, 2]) assert.throws(() => assertSchema(partial, through), /does not match/);
  } finally { db.close(); }
  assert.throws(() => assertSchema(expectedSchema(1).filter((r) => r.type !== "index"), 1), /does not match/);
  const changed = expectedSchema(1).map((r) => ({ ...r, sql: r.sql.replace("NOT NULL", "") }));
  assert.throws(() => assertSchema(changed, 1), /does not match/);
  for (const applied of [[migrations[1]], [migrations[0], migrations[0]], ["unknown.sql"]]) {
    assert.throws(() => plan({ applied, schema: expectedSchema(2) }), /history/);
  }
  assert.throws(() => plan({ applied: migrations }), /table is missing/);
  assert.throws(() => plan({ applied: migrations.slice(0, 1), schema: expectedSchema(2) }), /does not match/);
});

test("CLI defaults local and rejects ambiguous or unsupported target flags", () => {
  assert.deepEqual(parseArgs(["apply"]).targetArgs, ["--local"]);
  assert.deepEqual(parseArgs(["status", "--remote"]).targetArgs, ["--remote"]);
  assert.deepEqual(parseArgs(["apply", "--persist-to", "/tmp/db"]).targetArgs, ["--local", "--persist-to", "/tmp/db"]);
  for (const args of [["apply", "--local", "--remote"], ["apply", "--remote", "--persist-to", "/tmp/db"],
    ["baseline"], ["baseline", "--through=0003"], ["apply", "--through=0002"], ["apply", "--config", "prod.toml"],
    ["apply", "--persist-to", "--remote"]]) assert.throws(() => parseArgs(args));
});
