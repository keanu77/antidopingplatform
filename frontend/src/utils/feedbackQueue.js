export const PENDING_KEY = "adp-fb-pending";
export const PENDING_TTL = 7 * 24 * 3600_000;

export function identifyFeedback(payload, previous, uuid = () => crypto.randomUUID()) {
  const { requestId: _id, ...content } = payload;
  const { requestId: priorId, ...priorContent } = previous || {};
  return { ...content, requestId: priorId && JSON.stringify(content) === JSON.stringify(priorContent) ? priorId : (_id || uuid()) };
}

export function readPending(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(PENDING_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((p) => p && typeof p === "object" && !Array.isArray(p))
      .map((p) => ({ ...identifyFeedback(p), queuedAt: Number.isFinite(p.queuedAt) ? p.queuedAt : now }))
      .filter((p) => p.queuedAt <= now && now - p.queuedAt < PENDING_TTL).slice(-20);
  } catch { return []; }
}

export function queueFeedback(storage, payload, now = Date.now()) {
  try {
    const pending = readPending(storage, now).filter((p) => p.requestId !== payload.requestId);
    pending.push({ ...identifyFeedback(payload), queuedAt: now });
    storage.setItem(PENDING_KEY, JSON.stringify(pending.slice(-20)));
    return true;
  } catch { return false; }
}

let flushing;
export function flushFeedback(storage, send, clock = Date.now) {
  if (flushing) return flushing;
  flushing = (async () => {
    const pending = readPending(storage, clock());
    // Persist IDs for migrated queues BEFORE transmission, including lost-ACK retries.
    try { storage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch { return; }
    for (const payload of pending) {
      // Clearing the queue cancels every request that has not started yet.
      if (!readPending(storage, clock()).some((p) => p.requestId === payload.requestId)) continue;
      const result = await send(payload);
      if (result.ok) {
        // Re-read: preserve feedback queued while the network request was pending.
        try {
          const current = readPending(storage, clock()).filter((p) => p.requestId !== payload.requestId);
          storage.setItem(PENDING_KEY, JSON.stringify(current));
        } catch { /* Keep ID for safe retry. */ }
      }
    }
  })().finally(() => { flushing = undefined; });
  return flushing;
}
