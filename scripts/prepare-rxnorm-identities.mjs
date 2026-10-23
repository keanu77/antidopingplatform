import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const root = new URL("../", import.meta.url);
const compiled = await build({ entryPoints: [fileURLToPath(new URL("frontend/src/utils/drugAssessment.js", root))], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, normalizeDrugIngredientName: normalize } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
const dir = new URL("artifacts/drugs/evidence-2026/", root);
const raw = await readFile(new URL("rxnorm-concepts.json", dir));
const meta = JSON.parse(await readFile(new URL("rxnorm-concepts.meta.json", dir), "utf8"));
if (createHash("sha256").update(raw).digest("hex") !== meta.sha256) throw new Error("RxNorm identity checksum mismatch");
const archive = await readFile(new URL("data/drugs/catalog.json.gz", root));
const source = JSON.parse(await readFile(new URL("data/drugs/manifest.json", root), "utf8"));
if (createHash("sha256").update(archive).digest("hex") !== source.catalogSha256) throw new Error("TFDA checksum mismatch");
const names = new Set(JSON.parse(gunzipSync(archive)).products.filter((p) => !p.cancellation).flatMap((p) => p.ingredientNames)
  .filter((name) => !matchDrugIngredient(name)).map(normalize));
const pins = JSON.parse(raw).minConceptGroup.minConcept.filter((row) => row.tty === "PIN" && names.has(normalize(row.name)));
await writeFile(new URL("rxnorm-pins-pending.json", dir), JSON.stringify(pins, null, 2) + "\n");
console.log(JSON.stringify({ preciseIngredientsForIdentityReview: pins.length }));
