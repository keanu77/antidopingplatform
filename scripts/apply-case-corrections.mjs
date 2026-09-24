/** Apply reviewed edits after legacy ID assignment; preserve existing URLs. */
export function applyCaseCorrections(input, review) {
  const byId = new Map(input.map((c) => [String(c.id), structuredClone(c)]));
  for (const edit of review.corrections) {
    const original = byId.get(edit.id);
    if (!original || original.athleteName !== edit.expectedName) {
      throw new Error(`Correction identity mismatch: ${edit.id}`);
    }
    byId.set(edit.id, { ...original, ...edit.set, id: edit.id });
  }
  for (const item of review.quarantine) {
    if (byId.get(item.id)?.athleteName !== item.expectedName) {
      throw new Error(`Quarantine identity mismatch: ${item.id}`);
    }
    byId.delete(item.id);
  }
  for (const [oldId, canonicalId] of Object.entries(review.redirects)) {
    if (!byId.has(oldId) || !byId.has(canonicalId)) throw new Error(`Invalid merge: ${oldId}`);
    byId.delete(oldId);
  }
  for (const item of review.additions) {
    if (byId.has(item.id)) throw new Error(`Duplicate addition: ${item.id}`);
    byId.set(item.id, structuredClone(item));
  }
  return [...byId.values()].map((c) => ({ ...c, review: c.review ?? {
    status: "pending", caseType: "歷史資料（待逐案查核）", outcome: "尚未完成個案來源與最新裁決核對",
    checkedAt: null,
  } }));
}
