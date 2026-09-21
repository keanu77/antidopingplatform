import { describe, it, expect } from "vitest";
import { summarize, buildDigestText, buildDigestHtml, secretMatches, rowFromD1 } from "../_lib/digest.js";

const rows = [
  { type: "rating", toolSlug: "/tue", rating: 2 },
  { type: "rating", toolSlug: "/tue", rating: 4 },
  { type: "rating", toolSlug: "/cases", rating: 5 },
  { type: "feedback", toolSlug: "/cases", rating: 1, issueType: "載入太慢", message: "<b>慢</b>", email: "a@b.co" },
  { type: "error", toolSlug: "/tue", errorType: "內容有誤", description: "年份錯", url: "javascript:alert(1)" },
  { type: "issue", toolSlug: "/smoke", message: "舊版問題回報" },
];

describe("summarize", () => {
  it("平均只算 type=rating，feedback 的星數不重複計入；低分頁排前面", () => {
    const s = summarize(rows);
    expect(s.ratings).toHaveLength(3);
    expect(s.overall).toBeCloseTo((2 + 4 + 5) / 3);
    expect(s.ranked.map((t) => t.slug)).toEqual(["/tue", "/cases"]);
    expect(s.ranked[0]).toMatchObject({ mean: 3, n: 2 });
  });
  it("舊版 issue 併入文字建議，不會從信裡消失", () => {
    const s = summarize(rows);
    expect(s.errors).toHaveLength(1);
    expect(s.messages.map((m) => m.message)).toEqual(["<b>慢</b>", "舊版問題回報"]);
  });
});

describe("信件內容", () => {
  it("HTML 跳脫使用者輸入，且不把非 http(s) 的 url 做成連結", () => {
    const html = buildDigestHtml(rows);
    expect(html).toContain("&lt;b&gt;慢&lt;/b&gt;");
    expect(html).not.toContain("<b>慢</b>");
    expect(html).not.toContain("javascript:alert");
    expect(html).toContain("共 6 筆");
  });
  it("純文字版含三個區塊", () => {
    const text = buildDigestText(rows);
    expect(text).toContain("【評分】整體平均 3.67 星");
    expect(text).toContain("【錯誤回報】");
    expect(text).toContain("【使用建議 / 許願】");
  });
});

describe("secretMatches", () => {
  it("相同才過；長度不同、空值、未設定一律不過", () => {
    expect(secretMatches("abc123", "abc123")).toBe(true);
    expect(secretMatches("abc124", "abc123")).toBe(false);
    expect(secretMatches("abc", "abc123")).toBe(false);
    expect(secretMatches("", "")).toBe(false);
    expect(secretMatches("x", undefined)).toBe(false);
  });
});

describe("rowFromD1", () => {
  it("snake_case 欄位轉成彙整用的欄位名，page 即 toolSlug", () => {
    expect(rowFromD1({ type: "error", page: "/tue", error_type: "內容有誤", issue_type: null, rating: null, description: "d" }))
      .toMatchObject({ type: "error", toolSlug: "/tue", errorType: "內容有誤", description: "d" });
  });
});
