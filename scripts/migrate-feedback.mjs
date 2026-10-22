#!/usr/bin/env node
// Keep D1's native migration ledger; legacy adoption is an explicit, schema-checked step.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const database = "antidoping-feedback";
export const schemaQuery = "SELECT type, name, sql FROM sqlite_master WHERE tbl_name IN ('feedback', 'feedback_delivery') AND sql IS NOT NULL ORDER BY type, name";
export const ledgerSql = `CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

export function parseArgs(args) {
  const [action, ...flags] = args;
  if (!["apply", "baseline", "status"].includes(action)) throw new Error("Expected apply, baseline or status.");
  let target = "--local", explicitTarget = false, through, persist;
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (flag === "--local" || flag === "--remote") {
      if (explicitTarget) throw new Error("Choose exactly one target.");
      target = flag;
      explicitTarget = true;
    } else if (flag === "--persist-to" && flags[i + 1] && !flags[i + 1].startsWith("--") && !persist) {
      persist = flags[++i];
    } else if (/^--through=000[12]$/.test(flag) && !through) {
      through = Number(flag.split("=")[1]);
    } else throw new Error(`Unsupported argument: ${flag}`);
  }
  if (persist && target === "--remote") throw new Error("--persist-to is local only.");
  if ((action === "baseline") !== Boolean(through)) throw new Error("Only baseline requires --through=0001 or --through=0002.");
  return { action, target, through, targetArgs: [target, ...(persist ? ["--persist-to", persist] : [])] };
}

// Conservative comparison includes constraints, indexes and triggers, not just column names.
// Ignore comments/formatting only; unknown schema variants require manual review.
function canonicalSchema(rows) {
  return rows.map(({ type, name, sql }) => ({
    type, name, sql: sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim(),
  }));
}

export function expectedSchema(through, migrationsDir = join(root, "migrations")) {
  const db = new DatabaseSync(":memory:");
  try {
    for (const name of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort().slice(0, through)) {
      db.exec(readFileSync(join(migrationsDir, name), "utf8"));
    }
    return db.prepare(schemaQuery).all();
  } finally { db.close(); }
}

export function validateHistory(applied, migrations) {
  if (applied.some((name, i) => name !== migrations[i])) {
    throw new Error("Migration history is not a known consecutive prefix; stop and review the database history.");
  }
}

export function assertSchema(actual, through) {
  if (JSON.stringify(canonicalSchema(actual)) !== JSON.stringify(canonicalSchema(expectedSchema(through)))) {
    throw new Error(`Feedback schema does not match 000${through}; partial/unknown schema requires manual review. No baseline recorded.`);
  }
}

export function planMigration({ action, through, schema, applied, migrations }) {
  validateHistory(applied, migrations);
  if (action === "baseline") {
    if (applied.length > through) throw new Error("Database history is newer than the requested baseline.");
    assertSchema(schema, through);
    return migrations.slice(applied.length, through);
  }
  if (!schema.length) {
    if (applied.length) throw new Error("Migration history exists but the feedback table is missing; stop and review.");
  } else if (!applied.length) {
    throw new Error("Untracked feedback schema: inspect it, then explicitly baseline --through=0001 or --through=0002. Nothing applied.");
  } else if (applied.length <= migrations.length) {
    // Includes the case where 0001 was tracked but 0002 was executed manually.
    assertSchema(schema, applied.length);
  }
  return migrations.slice(applied.length);
}

export function main(args) {
  const options = parseArgs(args);
  const { action, through, targetArgs } = options;
  const migrations = readdirSync(join(root, "migrations")).filter((name) => name.endsWith(".sql")).sort();
  function wrangler(args, json = false) {
    const result = spawnSync(process.execPath, [join(root, "node_modules/wrangler/bin/wrangler.js"), "d1", ...args, ...targetArgs], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Wrangler failed.");
    if (!json) { process.stdout.write(result.stdout); return; }
    const responses = JSON.parse(result.stdout);
    if (!Array.isArray(responses) || responses.some((r) => r.success !== true)) throw new Error("D1 query failed.");
    return responses.flatMap((r) => r.results);
  }
  const query = (sql) => wrangler(["execute", database, "--command", sql, "--json"], true);
  const schema = query(schemaQuery);
  const ledger = query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'd1_migrations'");
  const applied = ledger.length ? query("SELECT name FROM d1_migrations ORDER BY id").map((r) => r.name) : [];
  if (action === "status") {
    // No migration list command here: Wrangler's list can create the ledger.
    console.log(JSON.stringify({ target: options.target, applied, schema }, null, 2));
    return;
  }
  const pending = planMigration({ action, through, schema, applied, migrations });
  if (action === "baseline") {
    if (pending.length) {
      const values = pending.map((name) => `('${name.replace(/'/g, "''")}')`).join(", ");
      query(`${ledgerSql}\nINSERT INTO d1_migrations (name) VALUES ${values};`);
    }
    console.log(`Baseline verified through 000${through}; recorded ${pending.length} migration(s). No feedback data changed.`);
    return;
  }
  if (!pending.length) { console.log("No pending migrations."); return; }
  wrangler(["migrations", "apply", database]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
