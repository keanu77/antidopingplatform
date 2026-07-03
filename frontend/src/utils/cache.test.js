import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CacheManager from "./cache.js";

describe("CacheManager", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("set / get 基本存取", () => {
    const c = new CacheManager(5, 1000);
    c.set({ q: "a" }, [1, 2, 3]);
    expect(c.get({ q: "a" })).toEqual([1, 2, 3]);
  });

  it("未命中回傳 null", () => {
    const c = new CacheManager();
    expect(c.get({ q: "none" })).toBeNull();
  });

  it("TTL 過期後回傳 null", () => {
    const c = new CacheManager(5, 1000);
    c.set({ q: "a" }, "v");
    vi.advanceTimersByTime(1001);
    expect(c.get({ q: "a" })).toBeNull();
  });

  it("超過 maxSize 淘汰最舊項目（FIFO）", () => {
    const c = new CacheManager(2, 10000);
    c.set({ q: 1 }, "a");
    c.set({ q: 2 }, "b");
    c.set({ q: 3 }, "c"); // 應淘汰 q:1
    expect(c.get({ q: 1 })).toBeNull();
    expect(c.get({ q: 2 })).toBe("b");
    expect(c.get({ q: 3 })).toBe("c");
  });

  it("clear 清空全部", () => {
    const c = new CacheManager();
    c.set({ q: 1 }, "a");
    c.clear();
    expect(c.get({ q: 1 })).toBeNull();
  });

  it("clearExpired 只清除過期項目", () => {
    const c = new CacheManager(10, 1000);
    c.set({ q: 1 }, "a");
    vi.advanceTimersByTime(1500);
    c.set({ q: 2 }, "b"); // 較新
    c.clearExpired();
    expect(c.get({ q: 1 })).toBeNull();
    expect(c.get({ q: 2 })).toBe("b");
  });

  it("getStats 統計筆數與命中次數", () => {
    const c = new CacheManager();
    c.set({ q: 1 }, "a");
    c.get({ q: 1 });
    c.get({ q: 1 });
    const stats = c.getStats();
    expect(stats.size).toBe(1);
    expect(stats.totalHits).toBe(2);
    expect(stats.averageHits).toBe(2);
  });
});
