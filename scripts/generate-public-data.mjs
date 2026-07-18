import { mkdir, readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const registry = JSON.parse(await readFile(new URL('data/registry.json', root), 'utf8'));
const publicPreservation = ({ status, document_sha256, preservation_locator }) => {
  const internal = typeof preservation_locator === 'string' && /^(restricted-local:|sha256:)/i.test(preservation_locator);
  return {
    status,
    document_sha256,
    access: internal ? 'restricted' : status === 'preserved' ? 'public' : 'unavailable',
    retrievability: internal ? 'internal_restricted_archive' : status === 'preserved' ? 'public_locator' : 'unavailable',
    public_locator: internal ? null : preservation_locator ?? null
  };
};
const publicSource = (source) => ({ ...source, preservation: publicPreservation(source.preservation) });
await mkdir(new URL('data/funds/', root), { recursive: true });
await mkdir(new URL('data/releases/', root), { recursive: true });
for (const fund of registry.funds) {
  const sourceIds = new Set(fund.identity_source_ids);
  const decisions = registry.decisions.filter((d) => d.fund_id === fund.record_id);
  const evidenceIds = new Set(decisions.flatMap((d) => d.evidence_ids));
  const evidence = registry.evidence.filter((e) => evidenceIds.has(e.evidence_id));
  evidence.forEach((e) => sourceIds.add(e.source_id));
  const changes = registry.changes.filter((change) => change.fund_id === fund.record_id);
  const record = { projection_schema:'ETFCTA-PUBLIC-EXPORT-001-v0.1.0', release: registry.release, generated_from: '../registry.json', fund, sources: registry.sources.filter((s) => sourceIds.has(s.source_id)).map(publicSource), evidence, decisions, changes };
  await writeFile(new URL(`data/funds/${fund.ticker.toLowerCase()}.json`, root), JSON.stringify(record, null, 2) + '\n');
}
const release = { projection_schema:'ETFCTA-PUBLIC-RELEASE-001-v0.1.0', registry_id:registry.registry_id, release:registry.release, release_date:registry.release_date, classification_standard:registry.classification_standard, classification_version:registry.classification_version, fund_ids:registry.funds.map((f)=>f.record_id), counts:{funds:registry.funds.length,sources:registry.sources.length,evidence:registry.evidence.length,decisions:registry.decisions.length,changes:registry.changes.length}, canonical_registry:'../registry.json' };
await writeFile(new URL(`data/releases/${registry.release}.json`, root), JSON.stringify(release, null, 2) + '\n');
await writeFile(new URL('data/changes.json', root), JSON.stringify({projection_schema:'ETFCTA-PUBLIC-CHANGES-001-v0.1.0',release:registry.release,generated_from:'registry.json',events:registry.changes},null,2)+'\n');
await writeFile(new URL('data/review-calendar.json', root), JSON.stringify({projection_schema:'ETFCTA-PUBLIC-REVIEW-CALENDAR-001-v0.1.0',release:registry.release,generated_from:'registry.json',reviews:registry.funds.map((fund)=>({fund_id:fund.record_id,ticker:fund.ticker,last_reviewed:fund.last_reviewed,review_due:fund.next_review_due,freshness_state:fund.freshness_state,decision_ids:Object.values(fund.dimensions).map((item)=>item.decision_id)}))},null,2)+'\n');
