// Curated inputs are explicit whole ingredient names. Search terms and green
// product rows are never converted into rules without an individual decision.
import { createHash } from "node:crypto";

const norm = (s) => String(s).normalize("NFKC").toLowerCase().replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
const exact = (s) => String(s).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const setKey = (names) => [...new Set(names.map(exact))].sort().join("\n");
const cmasPde5Names = new Set(["avanafil", "sildenafil", "tadalafil", "vardenafil"]);
// Reviewed shared M2 warning: IV volume and the three medical exceptions.
// Any different warning text requires review even if both status badges are green.
export const REVIEWED_GENERAL_WARNING_SHA256 = "8ab5b0868fc25a8258848102248593ae26dfa6a5dd475f047be7fb5fea52b930";
// These source labels can conceal separately restricted alkaloids. A green
// product badge is not evidence for a globally unrestricted material rule.
export const requiresConstituentReview = (name) => /\b(?:opium|ephedra)\b/i.test(String(name))
  || /^(?:clove(?: powder| flower)?|caryophilli flos powder|caryophilli flores|flos caryophylli|caryophillin powder|caryophyllus|eugenia powder)$/i.test(String(name).trim());

export function applyReferenceDecisions({ decisions, facts, products, evidence, extension, federation, match }) {
  const nextEvidence = structuredClone(evidence), nextExtension = structuredClone(extension);
  const byUrl = new Map(facts.map((f) => [f.url, f]));
  const byLicense = new Map(products.map((p) => [p.license, p]));
  const known = new Map(nextEvidence.groups.flatMap((g) => g.names.map((n) => [n, g])));
  const seen = new Map(), changes = [];
  if (decisions.schemaVersion !== 1 || !Array.isArray(decisions.entries)) throw new Error("Unsupported decisions schema");
  const checked = new Date(`${decisions.checkedAt}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(decisions.checkedAt || "") || !Number.isFinite(checked.getTime()) || checked.toISOString().slice(0, 10) !== decisions.checkedAt) throw new Error("Invalid review date");
  for (const d of decisions.entries) {
    const fail = (why) => { throw new Error(`${d.rawName}: ${why}`); };
    if (!d.rawName || !d.key || d.key !== norm(d.key) || !d.identityBasis || !d.rationale) fail("Missing explicit identity/rationale");
    if (!["named-unconditional", "named-cmas-conditional", "identity-only", "literal-identity-only"].includes(d.action)) fail("Unsupported decision action");
    const previous = seen.get(norm(d.rawName));
    if (previous && previous !== d.key) fail("Contradictory duplicate decision");
    seen.set(norm(d.rawName), d.key);
    const f = byUrl.get(d.url), product = f && byLicense.get(f.license);
    if (!f || !product || f.sha256 !== d.sha256 || !/^[a-f0-9]{64}$/.test(d.sha256)) fail("Missing pinned source fact");
    if (!/^https:\/\/www\.check-antidoping\.org\.tw\/inquiry_page\.php\?id=\d+&category=2$/.test(f.url)) fail("Unexpected reference URL");
    if (!f.ingredientNames.some((n) => exact(n) === exact(d.rawName))) fail("Requested ingredient absent from actual result");
    if (product.conflictingFields?.length || setKey(product.ingredientNames) !== setKey(f.ingredientNames)
      || setKey(product.ingredientSummary.split(";;").filter((n) => n.trim())) !== setKey(f.ingredientNames)
      || !f.compositionMatchesTfda || !f.sourceSummaryMatchesTfda) fail("TFDA composition conflict");
    const existing = match(d.rawName), target = match(d.key);
    if (existing && existing.key !== d.key) fail(`Existing identity is ${existing.key}`);
    if (target && target.key !== d.key) fail(`Canonical name already resolves to ${target.key}`);
    if (d.action.endsWith("identity-only") && !target) fail("Identity cannot create an antidoping rule");
    if (d.action === "literal-identity-only") {
      // An explicitly reviewed source string may contain defective punctuation.
      // Preserve it verbatim (apart from case/width/whitespace), never repair it
      // or broaden the ordinary parser's rejection of malformed names.
      const literal = exact(d.rawName);
      const record = { key: d.key, evidence: { type: "reviewed-literal-name", url: f.url,
        sourceSha256: f.sha256, referenceLicense: f.license, checkedAt: decisions.checkedAt,
        identityBasis: d.identityBasis, clinicalReview: "pending" } };
      const prior = nextExtension.reviewedLiteralAliases?.[literal];
      if (prior && JSON.stringify(prior) !== JSON.stringify(record)) fail("Reviewed literal identity changed");
      if (!prior) {
        nextExtension.reviewedLiteralAliases ??= {};
        nextExtension.reviewedLiteralAliases[literal] = record;
        changes.push({ type: "literal-alias", key: d.key, rawName: d.rawName });
      }
      continue;
    }
    if (d.action.startsWith("named-")) {
      if (f.ingredientNames.some(requiresConstituentReview)) fail("Material requires independent constituent review");
      if (f.warningSha256 !== REVIEWED_GENERAL_WARNING_SHA256) fail("Unreviewed warning text");
      // TFDA puts approved biological medicines (e.g. denosumab) in 菌疫.
      // Raw materials, capsule shells and in-vitro reagents are not approvals
      // for therapeutic use in a human formulation.
      if (product.cancellation || product.validUntil < decisions.checkedAt || !["製劑", "菌疫"].includes(product.licenseType.replace(/\s/g, ""))) fail("No current human medicine approval");
      if (d.action === "named-cmas-conditional") {
        const expectedCode = cmasPde5Names.has(d.key)
          ? "PDE 5 inhibitors 僅限CMAS（世界潛水聯盟）所屬之運動項目禁用"
          : "BZD僅限CMAS（世界潛水聯盟）所屬之運動項目禁用";
        if (!federation?.names.includes(d.key) || d.federationSourceSha256 !== federation.source.sha256
          || d.specificUsageSha256 !== createHash("sha256").update(f.specificUsage || "").digest("hex")
          || setKey(f.ingredientNames) !== exact(d.rawName) || !f.hasSpecificUsage
          || f.inCompetition !== "部份運動禁止" || f.outOfCompetition !== "部份運動禁止"
          || f.wadaCode !== expectedCode
          || !f.specificUsage.includes("72小時") || exact(f.substanceField) !== exact(d.key)) fail("Unreviewed federation conditions");
      } else if (f.hasSpecificUsage || f.specificUsage || f.inCompetition !== "不禁止" || f.outOfCompetition !== "不禁止" || f.wadaCode || f.substanceField !== "不含禁用物質") fail("Reference has restrictions or conditions");
      if (target && (target.rule.prohibition !== "not-prohibited" || target.rule.routes || target.rule.referenceRoutes || target.rule.sportRestricted)) fail("Cannot override a primary restriction");
      // A contradictory restricted constituent invalidates the green product evidence.
      if (f.ingredientNames.some((n) => {
        const r = match(n)?.rule;
        // Limited positive evidence for another constituent is not a known
        // prohibition. Its own scope remains protected by the target check.
        return r && (r.routes || ["in-competition", "in-and-out", "sport-specific"].includes(r.prohibition));
      })) fail("Reference conflicts with known constituent conditions");
      const sourceId = `tada${new URL(f.url).searchParams.get("id")}`;
      if (nextEvidence.sources[sourceId] && nextEvidence.sources[sourceId].sha256 !== f.sha256) fail("Pinned source changed");
      if (!target && !known.has(d.key)) {
        nextEvidence.sources[sourceId] ??= {
          title: `TADA 公開商品查詢：${f.license}`, url: f.url, checkedAt: f.retrievedAt.slice(0, 10), sha256: f.sha256,
          scope: "逐項來源查核；不代表本專案臨床審核或完整資料庫授權。",
        };
        const group = { source: sourceId, pages: "主成分略述、賽內／賽外狀態及使用規範", prohibition: "not-prohibited", names: [d.key],
          derivation: d.rationale, ingredientEvidence: { [d.key]: { rawName: d.rawName, identityBasis: d.identityBasis,
            referenceLicense: f.license, sourceSha256: f.sha256, checkedAt: decisions.checkedAt,
            clinicalReview: "pending", ...(d.action === "named-cmas-conditional" ? { federationRule: "cmas", federationSourceSha256: d.federationSourceSha256 } : {}),
            decisionSha256: createHash("sha256").update(JSON.stringify(d)).digest("hex") } } };
        nextEvidence.groups.push(group); known.set(d.key, group);
        changes.push({ type: "rule", key: d.key, rawName: d.rawName });
      }
    }
    const alias = norm(d.rawName), priorAlias = nextExtension.aliases[alias];
    if (priorAlias && priorAlias !== d.key) fail("Alias contradicts existing explicit alias");
    if (alias !== d.key && !priorAlias) {
      nextExtension.aliases[alias] = d.key;
      changes.push({ type: "alias", key: d.key, rawName: d.rawName });
    }
  }
  return { evidence: nextEvidence, extension: nextExtension, changes };
}
