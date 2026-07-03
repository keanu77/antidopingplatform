import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce, throttle } from "./debounce.js";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("延遲後才執行，且只以最後一次的參數執行一次", () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d("a");
    d("b");
    d("c");
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("cancel 取消尚未執行的呼叫", () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d("a");
    d.cancel();
    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it("flush 立即執行並回傳結果", () => {
    const fn = vi.fn(() => "result");
    const d = debounce(fn, 300);
    d("x");
    const r = d.flush();
    expect(fn).toHaveBeenCalledWith("x");
    expect(r).toBe("result");
  });
});

describe("throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("首次立即執行，限制期間內不重複，期滿後補跑尾端", () => {
    const fn = vi.fn();
    const t = throttle(fn, 1000);
    t("a"); // 立即執行
    expect(fn).toHaveBeenCalledTimes(1);
    t("b"); // 節流中，排入尾端
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
