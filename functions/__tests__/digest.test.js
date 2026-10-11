import { describe, it, expect } from "vitest";
import {
  summarize,
  buildDigestText,
  buildDigestHtml,
  secretMatches,
  rowFromD1,
  sameSiteUrl,
} from "../_lib/digest.js";

const rows = [
  { type: "rating", toolSlug: "/tue", rating: 2 },
  { type: "rating", toolSlug: "/tue", rating: 4 },
  { type: "rating", toolSlug: "/cases", rating: 5 },
  {
    type: "feedback",
    toolSlug: "/cases",
    rating: 1,
    issueType: "載入太慢",
    message: "<b>慢</b>",
    email: "a@b.co",
  },
  {
    type: "error",
    toolSlug: "/tue",
    errorType: "內容有誤",
    description: "年份錯",
    url: "javascript:alert(1)",
  },
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
    expect(s.messages.map((m) => m.message)).toEqual([
      "<b>慢</b>",
      "舊版問題回報",
    ]);
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
  it("只有本站 origin 的 url 做成連結，其他 origin 只顯示文字", () => {
    const errorRow = (url) => ({ type: "error", toolSlug: "/tue", errorType: "內容有誤", url });
    const own = buildDigestHtml([errorRow("https://antidopingplatform.sportsmedicine.tw/cases/1")]);
    expect(own).toContain('href="https://antidopingplatform.sportsmedicine.tw/cases/1"');
    expect(own).toContain("開啟頁面");

    const phishing = buildDigestHtml([errorRow("https://evil.example/login")]);
    expect(phishing).not.toContain('href="https://evil.example');
    expect(phishing).not.toContain("開啟頁面");
    expect(phishing).toContain("非本站，未建立連結");

    const custom = buildDigestHtml([errorRow("https://preview.example/cases/1")], "https://preview.example");
    expect(custom).toContain('href="https://preview.example/cases/1"');
  });
  it.each([
    "http://antidopingplatform.sportsmedicine.tw/tue",
    "https://antidopingplatform.sportsmedicine.tw:8443/tue",
    "https://user:password@antidopingplatform.sportsmedicine.tw/tue",
    "https://antidopingplatform.sportsmedicine.tw.evil.example/",
    "https://antidopingplatform.sportsmedicine.tw@evil.example/",
    "https://antidopingplatform.sportsmedicine.tw./tue",
    "//antidopingplatform.sportsmedicine.tw/tue",
    "/tue",
    "https://antidopingplatform.sportsmedicine.tw:65536/tue",
    "blob:https://antidopingplatform.sportsmedicine.tw/id",
  ])("不信任 %s，HTML 不產生開啟頁面連結", (url) => {
    expect(sameSiteUrl(url)).toBeNull();
    const html = buildDigestHtml([{ type: "error", toolSlug: "/tue", url }]);
    expect(html).not.toContain("開啟頁面");
  });
  it("依 URL 標準正規化預設 port、大小寫、路徑，並跳脫 href", () => {
    const url = "https://ANTIDOPINGPLATFORM.SPORTSMEDICINE.TW:443/a/../tue?a=1&b=2#section";
    expect(sameSiteUrl(url)).toBe("https://antidopingplatform.sportsmedicine.tw/tue?a=1&b=2#section");
    expect(buildDigestHtml([{ type: "error", toolSlug: "/tue", url }])).toContain(
      'href="https://antidopingplatform.sportsmedicine.tw/tue?a=1&amp;b=2#section"',
    );
  });
  it("自訂 origin 必須包含相同協定與有效 port", () => {
    const site = "http://localhost:8788/base";
    expect(sameSiteUrl("http://localhost:8788/tue", site)).toBe("http://localhost:8788/tue");
    expect(sameSiteUrl("http://localhost/tue", site)).toBeNull();
    expect(sameSiteUrl("https://localhost:8788/tue", site)).toBeNull();
    expect(sameSiteUrl("http://localhost:8789/tue", site)).toBeNull();
    expect(sameSiteUrl("https://preview.example:8443/tue", "https://preview.example:8443")).toBe(
      "https://preview.example:8443/tue",
    );
    for (const invalidSite of ["not a url", "javascript:alert(1)", "blob:https://preview.example/id", "https://user@preview.example"]) {
      expect(sameSiteUrl("https://preview.example/tue", invalidSite)).toBeNull();
    }
  });
  it("不可信網址只作跳脫後的文字", () => {
    const html = buildDigestHtml([{ type: "error", toolSlug: "/tue", url: 'https://evil.example/\"><img src=x>' }]);
    expect(html).toContain("&quot;&gt;&lt;img src=x&gt;");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("開啟頁面");
  });
  it("sameSiteUrl 擋掉相似網域、非 http(s) 與無法解析的網址", () => {
    const site = "https://antidopingplatform.sportsmedicine.tw";
    expect(sameSiteUrl("https://antidopingplatform.sportsmedicine.tw/tue", site)).toBe(
      "https://antidopingplatform.sportsmedicine.tw/tue",
    );
    expect(sameSiteUrl("https://antidopingplatform.sportsmedicine.tw.evil.example/", site)).toBeNull();
    expect(sameSiteUrl("https://evil.example/?u=antidopingplatform.sportsmedicine.tw", site)).toBeNull();
    expect(sameSiteUrl("https://user@evil.example/", site)).toBeNull();
    expect(sameSiteUrl("javascript:alert(1)", site)).toBeNull();
    expect(sameSiteUrl("not a url", site)).toBeNull();
    expect(sameSiteUrl(undefined, site)).toBeNull();
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
    expect(
      rowFromD1({
        type: "error",
        page: "/tue",
        error_type: "內容有誤",
        issue_type: null,
        rating: null,
        description: "d",
      }),
    ).toMatchObject({
      type: "error",
      toolSlug: "/tue",
      errorType: "內容有誤",
      description: "d",
    });
  });

  it("feedback-v1：message 內的 JSON 還原成原始類型與欄位", () => {
    const detail = {
      格式: "feedback-v1",
      回饋類型: "error",
      錯誤類型: "案例資料錯誤",
      問題描述: "年份錯",
      建議內容: "核對來源",
      參考來源: "https://x.invalid",
      填寫者身分: "一般民眾",
      回覆聯絡信箱: "a@b.co",
      頁面網址: "https://site/cases/1",
    };
    expect(
      rowFromD1({
        type: "issue",
        page: "/cases/1",
        rating: null,
        message: JSON.stringify(detail),
      }),
    ).toMatchObject({
      type: "error",
      toolSlug: "/cases/1",
      message: "",
      errorType: "案例資料錯誤",
      description: "年份錯",
      suggestion: "核對來源",
      refs: "https://x.invalid",
      role: "一般民眾",
      email: "a@b.co",
      url: "https://site/cases/1",
    });
  });

  it("feedback-v1 的 feedback 類型：評分與使用回饋還原，但仍不計入平均", () => {
    const detail = {
      格式: "feedback-v1",
      回饋類型: "feedback",
      評分: 2,
      問題類型: "載入太慢",
      使用回饋: "很慢",
    };
    const row = rowFromD1({
      type: "issue",
      page: "/tue",
      rating: null,
      message: JSON.stringify(detail),
    });
    expect(row).toMatchObject({
      type: "feedback",
      rating: 2,
      issueType: "載入太慢",
      message: "很慢",
    });
    expect(summarize([row]).ratings).toHaveLength(0);
    expect(summarize([row]).messages).toHaveLength(1);
  });

  it("非 JSON 的舊 issue 訊息原樣保留", () => {
    expect(
      rowFromD1({
        type: "issue",
        page: "/smoke",
        rating: null,
        message: "{壞掉的 json",
      }),
    ).toMatchObject({ type: "issue", message: "{壞掉的 json" });
  });
});
