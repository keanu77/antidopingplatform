// These transformations apply only to a complete name observed in the TFDA export.
// They never create a substring/brand matcher or infer an antidoping verdict.
export function tfdaEquivalentKey(name, match) {
  const expression = /^([^()]+)((?:\s*\(\s*eq\.?\s*to\s+[^()]+\)\s*)+)$/i.exec(name);
  if (!expression || /;;|；|\+|\b(?:and|with|mixture|extract)\b/i.test(name)) return null;
  const alternatives = [expression[1], ...[...expression[2].matchAll(/\(\s*eq\.?\s*to\s+([^()]+)\)/gi)].map((m) => m[1])];
  const keys = new Set(alternatives.map((n) => match(n.trim())).filter(Boolean));
  // TFDA explicitly states identity. A known contradictory identity vetoes it.
  return keys.size === 1 ? [...keys][0] : null;
}

export function tfdaPhysicalSpelling(name) {
  return name.normalize("NFKC").replace(/\(\s*as\s+([^()]+)\)/gi, " $1 ")
    .replace(/\b(?:\d+(?:\.\d+)?\s*)?H2O\b/gi, " ")
    .replace(/\b(?:micronized|micronised|sterile|crystalline|anhydrous|monohydrate|dihydrate|trihydrate|tetrahydrate|pentahydrate|hexahydrate|heptahydrate|octahydrate|decahydrate|dodecahydrate|hemihydrate|sesquihydrate|hydrate)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
}

export function rxnormPreciseIngredientKey(fact, keyForName) {
  if (fact.precise?.tty !== "PIN" || fact.parents?.length !== 1) return null;
  const parent = fact.parents[0];
  if (parent.tty !== "IN" || parent.suppress !== "N") return null;
  return keyForName(parent.name) || null;
}
