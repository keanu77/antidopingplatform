import { describe, it, expect } from "vitest";
import { TAIWAN_DRUG_LOOKUPS } from "./taiwanDrugLookups.js";

describe("TAIWAN_DRUG_LOOKUPS", () => {
  it("links each official category over HTTPS to the government lookup", () => {
    expect(TAIWAN_DRUG_LOOKUPS.map((l) => [l.category, l.label])).toEqual([
      [1, "禁用物質"], [2, "西藥藥品"], [3, "中藥藥品"], [4, "營養品"],
    ]);
    for (const l of TAIWAN_DRUG_LOOKUPS) {
      const url = new URL(l.url);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("www.check-antidoping.org.tw");
      expect(url.searchParams.get("category")).toBe(String(l.category));
    }
  });
});
