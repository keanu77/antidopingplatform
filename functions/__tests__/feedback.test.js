import { describe, it, expect } from "vitest";
import { normalizeFeedback } from "../_lib/feedback.js";

const NOW = 1_800_000_000_000;
const opts = { now: NOW, userAgent: "Mozilla/5.0 (iPhone) Mobile Safari" };
// 前端 FeedbackBar 的 base()：每種類型都會帶這些
const base = { toolSlug: "/tue", url: "https://x.test/tue", loadedAt: NOW - 10_000, website: "" };

describe("normalizeFeedback：對齊前端 FeedbackBar 的三種 payload", () => {
  it("rating：一鍵點星", () => {
    const r = normalizeFeedback({ ...base, type: "rating", rating: 4 }, opts);
    expect(r.status).toBe("ok");
    expect(r.row).toMatchObject({ type: "rating", rating: 4, page: "/tue", url: "https://x.test/tue", uaClass: "手機/Safari" });
  });

  it("feedback：保留 issueType / message / role / email", () => {
    const r = normalizeFeedback(
      { ...base, type: "feedback", rating: 3, issueType: "內容不夠", message: " 想看更多案例 ", role: "醫師/醫療人員", email: "a@b.co" },
      opts,
    );
    expect(r.status).toBe("ok");
    expect(r.row).toMatchObject({ type: "feedback", rating: 3, issueType: "內容不夠", message: "想看更多案例", role: "醫師/醫療人員", email: "a@b.co" });
  });

  it("error：不需要 rating，description 必填（這是遷移後被 400 擋掉的那條）", () => {
    const r = normalizeFeedback(
      { ...base, type: "error", errorType: "內容有誤", description: "年份寫錯", suggestion: "應為 2016", refs: "WADA", resultSnapshot: "x".repeat(5000) },
      opts,
    );
    expect(r.status).toBe("ok");
    expect(r.row).toMatchObject({ type: "error", rating: null, errorType: "內容有誤", description: "年份寫錯", suggestion: "應為 2016", refs: "WADA" });
    expect(r.row.snapshot).toHaveLength(4000);
  });

  it("error 缺 errorType / description → 400", () => {
    expect(normalizeFeedback({ ...base, type: "error", description: "x" }, opts)).toMatchObject({ status: "error", code: 400 });
    expect(normalizeFeedback({ ...base, type: "error", errorType: "x" }, opts)).toMatchObject({ status: "error", code: 400 });
  });

  it("未知類型、缺頁面識別、評分越界、Email 格式錯 → 400", () => {
    expect(normalizeFeedback({ ...base, type: "nope" }, opts).code).toBe(400);
    expect(normalizeFeedback({ type: "rating", rating: 5 }, opts).code).toBe(400);
    expect(normalizeFeedback({ ...base, type: "rating", rating: 6 }, opts).code).toBe(400);
    expect(normalizeFeedback({ ...base, type: "feedback", rating: 5, email: "bad" }, opts).code).toBe(400);
  });

  it("白名單外的 role 存成 null；非 error 類型不存 snapshot", () => {
    const r = normalizeFeedback({ ...base, type: "feedback", rating: 5, role: "駭客", resultSnapshot: "s" }, opts);
    expect(r.row.role).toBeNull();
    expect(r.row.snapshot).toBeNull();
  });
});

describe("normalizeFeedback：防機器人", () => {
  it("honeypot 有值 → 靜默丟棄", () => {
    expect(normalizeFeedback({ ...base, type: "rating", rating: 5, website: "http://spam" }, opts).status).toBe("drop");
  });
  it("time-trap：非 rating 在 1.5 秒內送出 → 丟棄；rating 不受限", () => {
    const fast = { ...base, loadedAt: NOW - 500 };
    expect(normalizeFeedback({ ...fast, type: "feedback", rating: 5 }, opts).status).toBe("drop");
    expect(normalizeFeedback({ ...fast, type: "rating", rating: 5 }, opts).status).toBe("ok");
  });
});

describe("normalizeFeedback：舊版 issue 類型（smoke test 仍在用）", () => {
  it("issue + message + page 仍可寫入；缺 message → 400", () => {
    const r = normalizeFeedback({ type: "issue", message: "smoke-test", page: "/smoke" }, opts);
    expect(r).toMatchObject({ status: "ok", row: { type: "issue", message: "smoke-test", page: "/smoke", rating: null } });
    expect(normalizeFeedback({ type: "issue", page: "/smoke" }, opts).code).toBe(400);
  });
});
