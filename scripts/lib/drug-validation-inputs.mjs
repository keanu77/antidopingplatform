// Supplemental references are measured against an unchanged product holdout.
// Cached HTML is independently reparsed by the caller before these checks.
export function mergeValidationReferences({ baseline, supplemental, allowedLicenses, frozenAt, checkpoint, identity, checkpointSha256, sampleSha256 }) {
  if (identity.checkpoint !== checkpoint || identity.checkpointManifestSha256 !== checkpointSha256 || identity.sampleSha256 !== sampleSha256) throw new Error('Supplemental collection identity mismatch');
  const cutoff = Date.parse(frozenAt);
  if (!Number.isFinite(cutoff)) throw new Error('Invalid freeze time');
  const merged = new Map(baseline.map((f) => [f.license, f]));
  if (merged.size !== baseline.length) throw new Error('Duplicate baseline reference');
  const supplementalLicenses = new Set();
  for (const f of supplemental) {
    if (!allowedLicenses.has(f.license) || f.collectedForLicense !== f.license || f.checkpoint !== checkpoint) throw new Error('Supplemental reference outside fixed sample');
    if (!/^https:\/\/www\.check-antidoping\.org\.tw\/inquiry_page\.php\?id=\d+&category=2$/.test(f.url) || !/^[a-f0-9]{64}$/.test(f.sha256)) throw new Error('Invalid supplemental provenance');
    if (!Number.isFinite(Date.parse(f.retrievedAt)) || Date.parse(f.retrievedAt) <= cutoff) throw new Error('Supplemental reference predates freeze');
    if (merged.has(f.license)) throw new Error('Cannot replace a frozen reference or insert duplicates');
    merged.set(f.license, f); supplementalLicenses.add(f.license);
  }
  return { facts: merged, supplementalLicenses };
}
