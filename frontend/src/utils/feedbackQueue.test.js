import { describe, it, expect } from "vitest";
import { identifyFeedback, queueFeedback, readPending, flushFeedback, PENDING_KEY, PENDING_TTL } from "./feedbackQueue";
const storage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
};
describe("feedback retry identity and retention", () => {
  it("reuses identity only for unchanged submissions", () => {
    const first = identifyFeedback({ type: "rating", rating: 5 }, null, () => "first");
    expect(identifyFeedback({ type: "rating", rating: 5 }, first).requestId).toBe("first");
    expect(identifyFeedback({ type: "rating", rating: 4 }, first, () => "second").requestId).toBe("second");
  });
  it("expires queued personal text after seven days and ignores malformed storage", () => {
    const s = storage();
    queueFeedback(s, { type: "rating", rating: 5 }, 100);
    expect(readPending(s, 100 + PENDING_TTL)).toEqual([]);
    s.setItem(PENDING_KEY, "{}");
    expect(readPending(s)).toEqual([]);
  });
  it("preserves IDs on failed sends and feedback added during a successful send", async () => {
    const s = storage();
    queueFeedback(s, { requestId: "first", type: "rating", rating: 5 }, 100);
    await flushFeedback(s, async () => ({ ok: false }), () => 100);
    expect(readPending(s, 100)[0].requestId).toBe("first");
    let now = 100;
    await flushFeedback(s, async () => {
      now = 101;
      queueFeedback(s, { requestId: "second", type: "rating", rating: 2 }, now);
      return { ok: true };
    }, () => now);
    expect(readPending(s, 101).map((p) => p.requestId)).toEqual(["second"]);
  });
  it("clearing cancels requests which have not started", async () => {
    const s = storage();
    for (const requestId of ["first", "second"]) queueFeedback(s, { requestId, type: "rating", rating: 5 }, 100);
    const sent = [];
    await flushFeedback(s, async (payload) => {
      sent.push(payload.requestId);
      s.removeItem(PENDING_KEY);
      return { ok: true };
    }, () => 100);
    expect(sent).toEqual(["first"]);
    expect(readPending(s, 100)).toEqual([]);
  });
});
