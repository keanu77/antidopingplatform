import { Link } from 'react-router-dom';
import { registry, assessEvidence } from '../../../shared/content-evidence.mjs';

export default function EvidenceLinks({ evidenceId }) {
  const entry = registry.entries[evidenceId];
  if (!entry) return <p className="mt-3 text-sm text-gray-700">尚無對應來源。<Link to="/sources" className="underline text-primary-700">查看來源與待核對項目</Link></p>;
  const version = registry.versions[entry.ruleVersion];
  const evidence = assessEvidence(evidenceId, entry.ruleVersion);
  return <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-700">
    <p>{version.label} · {registry.statusLabels[entry.verificationStatus]} · {entry.verifiedAt ? `來源核對 ${entry.verifiedAt}` : '尚未完成來源核對'}</p>
    {!evidence.valid && <p className="mt-1 text-amber-800">{evidence.reason}</p>}
    <ul className="mt-2 space-y-2">
      {entry.references.map(ref => <li key={`${ref.sourceId}:${ref.locator}`}><a className="text-primary-700 underline break-words" href={registry.sources[ref.sourceId].url} target="_blank" rel="noopener noreferrer">{registry.sources[ref.sourceId].title} — {ref.locator}</a></li>)}
    </ul>
    <Link className="inline-block mt-2 text-primary-700 underline" to={`/sources?id=${encodeURIComponent(evidenceId)}`}>查看核對範圍、有效期與修訂紀錄</Link>
  </div>;
}
