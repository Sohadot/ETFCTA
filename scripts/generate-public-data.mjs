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
const statusFor=(fund)=>{const decisions=registry.decisions.filter((d)=>d.fund_id===fund.record_id);const evidenceFor=(dimension)=>decisions.filter((d)=>d.dimension===dimension).flatMap((d)=>d.evidence_ids).map((id)=>registry.evidence.find((e)=>e.evidence_id===id)).filter(Boolean);const coverage=(dimension)=>{const records=evidenceFor(dimension);if(!records.length)return 'not_assessed';if(decisions.some((d)=>d.dimension===dimension&&d.result.startsWith('not_determinable')))return 'unresolved';return records.some((e)=>e.status==='corroborating_source')||records.length>1?'corroborated':'complete'};return {fund_id:fund.record_id,ticker:fund.ticker,last_reviewed:fund.last_reviewed,review_due:fund.next_review_due,coverage:{identity:'complete',strategy:coverage(fund.ticker==='KMLM'?'strategy_family':'replication_method'),market_breadth:coverage('market_breadth'),implementation:coverage('implementation_route'),signal_horizon:coverage('signal_horizon'),benchmark_relationship:coverage('benchmark_relationship'),holdings_freshness:registry.sources.some((s)=>s.source_id.startsWith(`SRC-${fund.ticker}-HOLDINGS`))?'current_at_admission':'not_available',independent_methodology:fund.ticker==='KMLM'?'missing':'not_assessed'}}};
await writeFile(new URL('data/evidence-status.json',root),JSON.stringify({projection_schema:'ETFCTA-PUBLIC-EVIDENCE-STATUS-001-v0.1.0',release:registry.release,generated_from:'registry.json',funds:registry.funds.map(statusFor),sources:registry.sources.map((source)=>({source_id:source.source_id,title:source.title,source_type:source.source_type,effective_date:source.effective_date??null,retrieved_at:source.retrieved_at,verification_status:source.verification_status,preservation_status:source.preservation.status,newer_version_status:'not_determined',link_check_status:'not_rechecked_in_sprint_3'}))},null,2)+'\n');
const unknownDecisions=registry.decisions.filter((decision)=>decision.result.startsWith('not_determinable'));
const gaps=unknownDecisions.map((decision)=>({gap_id:`GAP-${decision.fund_id.split('-').at(-1)}-${decision.dimension.toUpperCase().replaceAll('_','-')}`,fund_id:decision.fund_id,dimension:decision.dimension,state:'unresolved',decision_id:decision.decision_id,summary:decision.limitations[0],review_due:decision.review_due}));
gaps.push({gap_id:'GAP-KMLM-INDEPENDENT-METHODOLOGY',fund_id:'ETFCTA-FUND-US-KMLM',dimension:'methodology_source',state:'missing',decision_id:null,summary:'No standalone official KFA MLM Index methodology document was independently located during admission.',review_due:'2027-07-18'});
await writeFile(new URL('data/methodology-gaps.json',root),JSON.stringify({projection_schema:'ETFCTA-PUBLIC-METHODOLOGY-GAPS-001-v0.1.0',release:registry.release,generated_from:['registry.json','../sources/KMLM/source-pack.json'],gaps},null,2)+'\n');
