import { it, expect, vi } from "vitest";
import evidence from "../../../backend/data/drug-evidence-rules.json";
import extension from "../../../backend/data/drug-ingredient-rules.json";

it("invalid route scope cannot silently become an unrestricted ingredient", async () => {
  for (const referenceRoutes of [null, false, "", [], ["unknown-route"], ["topical"]]) {
    const modified = structuredClone(evidence);
    const group = modified.groups.find((entry) => entry.referenceRoutes);
    group.referenceRoutes = referenceRoutes;
    vi.resetModules();
    vi.doMock("../../../backend/data/drug-evidence-rules.json", () => ({ default: modified }));
    try {
      await expect(import("./drugAssessment.js")).rejects.toThrow("Invalid route-limited medicine evidence");
    } finally {
      vi.doUnmock("../../../backend/data/drug-evidence-rules.json");
      vi.resetModules();
    }
  }
});

it("literal source exceptions reject missing evidence and unknown or conflicting targets", async () => {
  const raw = Object.keys(extension.reviewedLiteralAliases)[0];
  for (const mutate of [
    (data) => { data.reviewedLiteralAliases = null; },
    (data) => { data.reviewedLiteralAliases[raw].key = "unreviewed compound"; },
    (data) => { data.reviewedLiteralAliases[raw].evidence.sourceSha256 = ""; },
    (data) => { data.reviewedLiteralAliases[raw].evidence.url = "https://example.com"; },
    (data) => { data.aliases[raw.replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim()] = "tramadol"; },
  ]) {
    const modified = structuredClone(extension);
    mutate(modified);
    vi.resetModules();
    vi.doMock("../../../backend/data/drug-ingredient-rules.json", () => ({ default: modified }));
    try {
      await expect(import("./drugAssessment.js")).rejects.toThrow("Invalid reviewed literal identity");
    } finally {
      vi.doUnmock("../../../backend/data/drug-ingredient-rules.json");
      vi.resetModules();
    }
  }
});
