import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateRegistry } from '../validation/registry-validator.mjs';

const clone = (value) => structuredClone(value);
const correction = {event_id:'CHG-TEST-001',fund_id:'ETFCTA-FUND-TEST-001',effective_date:'2026-01-01',recorded_at:'2026-01-02T00:00:00Z',dimension:'market_breadth',previous_value:'single_asset_family',new_value:'multi_asset',previous_decision_id:null,new_decision_id:'DEC-TEST-MB-001',change_type:'correction',trigger:'synthetic_negative_test',source_ids:['SRC-TEST-001'],standard_version:'ECS-001-v0.1.0'};

export async function runFixtureSuite(context, root) {
  const valid = JSON.parse(await readFile(path.join(root, 'tests/fixtures/canonical-valid.json'), 'utf8'));
  const run = (registry) => validateRegistry({ registry, ...context, fixturePassed:true, negativeTestsPassed:true });
  const validReport = run(valid);
  const cases = [
    ['source without hash', 'source_preservation', (r) => { r.sources[0].preservation.document_sha256 = null; }],
    ['evidence not admitted', 'evidence_sufficiency', (r) => { r.evidence[0].admission.state='extracted'; r.evidence[0].admission.history.pop(); }],
    ['invalid admission transition', 'admission_history', (r) => { r.evidence[0].admission.history.splice(1,1); }],
    ['manual sufficiency pass', 'evidence_sufficiency', (r) => { r.sources[0].verification_status='unverified'; }],
    ['incorrect review date', 'review_window', (r) => { r.decisions[0].review_due='2036-01-01'; }],
    ['foreign fund decision', 'fund_decision_ownership', (r) => { const other=clone(r.funds[0]); other.record_id='ETFCTA-FUND-TEST-002'; other.ticker='TST2'; r.funds.push(other); }],
    ['correction without previous decision', 'append_only_change', (r) => { r.changes.push(clone(correction)); }]
    ,['wrong field type', 'schema_validity', (r) => { r.funds[0].ticker=42; }]
    ,['undeclared nested field', 'schema_validity', (r) => { r.funds[0].dimensions.market_breadth.score=9; }]
    ,['malformed identifier', 'schema_validity', (r) => { r.evidence[0].evidence_id='bad id'; }]
    ,['missing reviewer role', 'decision_roles', (r) => { r.decisions[0].workflow.actions=r.decisions[0].workflow.actions.filter((action)=>action.role!=='reviewer'); }]
    ,['required second review incomplete', 'decision_roles', (r) => { r.decisions[0].workflow.second_review_required=true; }]
    ,['unsupported SG CTA tracking result', 'benchmark_claim_guard', (r) => { r.decisions[0].result='tracks_sg_cta_index'; }]
    ,['unsupported swap-only route', 'implementation_route_guard', (r) => { r.decisions[0].result='swaps_only'; }]
  ];
  const results = cases.map(([name, expectedCheck, mutate]) => {
    const registry=clone(valid); mutate(registry); const report=run(registry);
    return { name, expectedCheck, passed: report.checks[expectedCheck]?.passed === false };
  });
  return { validPassed: validReport.passed, negativePassed: results.every((item) => item.passed), results, validReport };
}
