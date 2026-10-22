import { describe, it, expect } from "vitest";
import { filterProhibitedList } from "./prohibitedSearch.js";

describe("分類摘要搜尋", () => {
  it.each([
    ["Vilanterol", "S3"], ["維蘭特羅", "S3"], ["胰島素", "S4"],
    [" albuterol ", "S3"], ["　ＶＩＬＡＮＴＥＲＯＬ　", "S3"],
    ["S4.4.2", "S4"], ["支氣管擴張劑", "S3"], ["利他能", "S6"],
  ])("%s 可找到 %s", (query, code) => {
    expect(filterProhibitedList(query).map((item) => item.code)).toContain(code);
  });
  it("空白等同未搜尋；篩選條件仍有效", () => {
    expect(filterProhibitedList(" 　")).toHaveLength(14);
    expect(filterProhibitedList("vilanterol", "in-competition")).toHaveLength(0);
    expect(filterProhibitedList("", "in-competition").every((item) => item.timing === "in-competition")).toBe(true);
  });
  it("未知藥物及未禁用藥物不憑空配對至禁用分類", () => {
    expect(filterProhibitedList("unknown-drug-123")).toEqual([]);
    expect(filterProhibitedList("glucagon")).toEqual([]);
  });
});
