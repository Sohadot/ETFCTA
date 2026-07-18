import { validateSchema } from './schema-subset.mjs';

const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10);
};
const makeCheck = () => ({ passed: true, errors: [] });
const push = (checks, name, condition, message) => { if (!condition) { checks[name].passed = false; checks[name].errors.push(message); } };

export function deriveSufficiency(decision, registry, rule) {
  const evidence = decision.evidence_ids.map((id) => registry.evidence.find((item) => item.evidence_id === id)).filter(Boolean);
  const sources = evidence.map((item) => registry.sources.find((source) => source.source_id === item.source_id)).filter(Boolean);
  const req = rule?.minimum_sufficiency;
  if (!rule || !req) return 'fail';
  if (!req.allow_unresolved_conflict && evidence.some((item) => item.status === 'conflicting')) return 'conflict';
  const pass = evidence.filter((item) => item.admission?.state === 'admitted').length >= req.min_admitted_evidence
    && (!req.require_verified_sources || sources.length === evidence.length && sources.every((item) => item.verification_status === 'verified'))
    && (!req.require_preserved_sources || sources.every((item) => item.preservation?.status === 'preserved' && /^[a-f0-9]{64}$/.test(item.preservation.document_sha256 ?? '')))
    && (!req.require_exact_locator || evidence.every((item) => item.location && Object.keys(item.location).length > 0))
    && evidence.every((item) => rule.required_evidence_types.includes(registry.sources.find((source) => source.source_id === item.source_id)?.source_type));
  return pass ? 'pass' : 'fail';
}

export function validateRegistry({ registry, schemas, rules, reviewWindows, vocab, ontology, glossary, releaseGate, fixturePassed = false, negativeTestsPassed = false }) {
  const checkNames = releaseGate.required_checks;
  const implemented = ['schema_validity','unique_ids','referential_integrity','source_identity','source_preservation','bounded_evidence','admission_history','active_rule','evidence_sufficiency','review_window','decision_status_derivation','decision_roles','fund_decision_ownership','append_only_change','standard_version','protocol_version','canonical_fixture','negative_tests'];
  const checks = Object.fromEntries(implemented.map((name) => [name, makeCheck()]));
  const collections = { fund: registry.funds, source: registry.sources, evidence: registry.evidence, decision: registry.decisions, change: registry.changes };
  const idField = { fund:'record_id', source:'source_id', evidence:'evidence_id', decision:'decision_id', change:'event_id' };

  for (const required of checkNames) push(checks, 'schema_validity', implemented.includes(required), `Unknown or unimplemented release check: ${required}`);
  for (const [kind, records] of Object.entries(collections)) {
    push(checks, 'schema_validity', Array.isArray(records), `${kind} collection must be an array.`);
    if (!Array.isArray(records)) continue;
    records.forEach((record, index) => validateSchema(record, schemas[kind], `${kind}[${index}]`).forEach((error) => push(checks, 'schema_validity', false, error)));
  }

  push(checks, 'standard_version', registry.classification_standard === rules.standard && registry.classification_version === rules.version, 'Registry and rule standard versions must agree.');
  push(checks, 'protocol_version', registry.evidence_protocol === 'EAP-001' && registry.evidence_protocol_version === '0.1.0', 'Active evidence protocol is invalid.');
  push(checks, 'standard_version', Boolean(registry.schema_version && registry.validator_version), 'Registry must declare schema and validator versions.');
  push(checks, 'active_rule', rules.rules.some((rule) => rule.status === 'active'), 'At least one active ECS rule is required.');
  push(checks, 'active_rule', new Set(rules.rules.map((rule) => `${rule.rule_id}@${rule.version}`)).size === rules.rules.length, 'Rule IDs and versions must be unique.');
  for (const rule of rules.rules) {
    push(checks, 'active_rule', rule.status === 'active' && rule.required_evidence_types.length > 0 && rule.result_vocabulary.length > 0, `${rule.rule_id}: incomplete active rule.`);
    push(checks, 'review_window', reviewWindows.windows.some((window) => window.review_window_id === rule.review_window_id), `${rule.rule_id}: unknown review window.`);
  }
  push(checks, 'standard_version', JSON.stringify(ontology.layers.change) === JSON.stringify(vocab.change_types), 'Change ontology and vocabulary differ.');
  push(checks, 'standard_version', new Set(glossary.terms.map((term) => term.term_id)).size === glossary.terms.length, 'Glossary IDs must be unique.');

  const ids = new Map();
  for (const [kind, records] of Object.entries(collections)) for (const record of records ?? []) {
    const id = record[idField[kind]];
    push(checks, 'unique_ids', Boolean(id) && !ids.has(id), `Duplicate or missing ${kind} ID: ${id ?? '(missing)'}.`); ids.set(id, kind);
  }

  const allowedTransitions = { candidate:['identity_verified','rejected'], identity_verified:['preserved','rejected'], preserved:['extracted','rejected'], extracted:['admitted','rejected'], admitted:['withdrawn','superseded'], rejected:[], withdrawn:[], superseded:[] };
  for (const source of registry.sources) {
    push(checks, 'source_identity', Boolean(source.title && source.authority && source.retrieved_at && Object.keys(source.locator ?? {}).length), `${source.source_id}: incomplete source identity.`);
    push(checks, 'source_preservation', source.preservation?.status !== 'preserved' || /^[a-f0-9]{64}$/.test(source.preservation.document_sha256 ?? ''), `${source.source_id}: preserved source requires SHA-256.`);
    push(checks, 'source_preservation', source.preservation?.status !== 'preservation_unavailable' || Boolean(source.preservation.limitation), `${source.source_id}: preservation limitation required.`);
  }
  for (const evidence of registry.evidence) {
    push(checks, 'referential_integrity', ids.get(evidence.source_id) === 'source', `${evidence.evidence_id}: unknown source.`);
    push(checks, 'bounded_evidence', Boolean(evidence.evidence_summary && Object.keys(evidence.location ?? {}).length && evidence.supports?.length), `${evidence.evidence_id}: evidence is not bounded.`);
    const history = evidence.admission?.history ?? [];
    push(checks, 'admission_history', history.at(-1)?.state === evidence.admission?.state, `${evidence.evidence_id}: final admission state mismatch.`);
    for (let i=1;i<history.length;i++) {
      push(checks, 'admission_history', allowedTransitions[history[i-1].state]?.includes(history[i].state), `${evidence.evidence_id}: invalid transition ${history[i-1].state} → ${history[i].state}.`);
      push(checks, 'admission_history', Date.parse(history[i].recorded_at) > Date.parse(history[i-1].recorded_at), `${evidence.evidence_id}: admission history is not chronological.`);
    }
  }
  for (const decision of registry.decisions) {
    push(checks, 'referential_integrity', ids.get(decision.fund_id) === 'fund', `${decision.decision_id}: unknown fund.`);
    const evidence = decision.evidence_ids.map((id) => registry.evidence.find((item) => item.evidence_id === id));
    evidence.forEach((item, index) => push(checks, 'referential_integrity', Boolean(item), `${decision.decision_id}: unknown evidence ${decision.evidence_ids[index]}.`));
    evidence.forEach((item) => item && push(checks, 'evidence_sufficiency', item.admission?.state === 'admitted', `${decision.decision_id}: evidence ${item.evidence_id} is not admitted.`));
    const rule = rules.rules.find((item) => item.rule_id === decision.rule_id && item.version === decision.rule_version && item.status === 'active');
    push(checks, 'active_rule', Boolean(rule), `${decision.decision_id}: active rule not found.`);
    if (rule) {
      push(checks, 'active_rule', rule.dimension === decision.dimension && rule.result_vocabulary.includes(decision.result), `${decision.decision_id}: result or dimension is outside rule vocabulary.`);
      const derived = deriveSufficiency(decision, registry, rule);
      push(checks, 'evidence_sufficiency', decision.sufficiency_result === derived, `${decision.decision_id}: declared sufficiency ${decision.sufficiency_result} differs from derived ${derived}.`);
      push(checks, 'decision_status_derivation', decision.decision_status !== 'confirmed' || derived === 'pass', `${decision.decision_id}: confirmed requires derived pass.`);
      const window = reviewWindows.windows.find((item) => item.review_window_id === rule.review_window_id);
      if (window) push(checks, 'review_window', decision.review_due === addDays(decision.decided_at, window.days), `${decision.decision_id}: review_due must equal ${addDays(decision.decided_at, window.days)}.`);
    }
    const actions=decision.workflow?.actions ?? [];
    for(const role of ['extractor','classifier','reviewer','publisher']) push(checks,'decision_roles',actions.some((action)=>action.role===role),`${decision.decision_id}: missing ${role} action.`);
    push(checks,'decision_roles',!decision.workflow?.second_review_required || decision.workflow?.second_review_completed,`${decision.decision_id}: required second review is incomplete.`);
    push(checks,'decision_roles',!actions.some((action)=>action.conflict_status==='recused' && ['reviewer','publisher'].includes(action.role)),`${decision.decision_id}: recused actor cannot review or publish.`);
  }
  for (const fund of registry.funds) for (const [dimension, pointer] of Object.entries(fund.dimensions)) {
    const decision = registry.decisions.find((item) => item.decision_id === pointer.decision_id);
    push(checks, 'referential_integrity', Boolean(decision), `${fund.record_id}: unknown decision ${pointer.decision_id}.`);
    if (decision) {
      push(checks, 'fund_decision_ownership', decision.fund_id === fund.record_id, `${fund.record_id}: decision belongs to another fund.`);
      push(checks, 'fund_decision_ownership', decision.dimension === dimension, `${fund.record_id}: decision dimension mismatch.`);
      push(checks, 'fund_decision_ownership', decision.result === pointer.value, `${fund.record_id}: current value differs from decision result.`);
    }
  }
  for (const change of registry.changes) {
    push(checks, 'referential_integrity', ids.get(change.fund_id) === 'fund', `${change.event_id}: unknown fund.`);
    change.source_ids.forEach((id) => push(checks, 'referential_integrity', ids.get(id) === 'source', `${change.event_id}: unknown source ${id}.`));
    push(checks, 'append_only_change', change.previous_value !== change.new_value || change.previous_decision_id !== change.new_decision_id, `${change.event_id}: no material transition.`);
    push(checks, 'append_only_change', change.change_type !== 'correction' || Boolean(change.previous_decision_id), `${change.event_id}: correction requires previous decision.`);
    push(checks, 'append_only_change', change.change_type !== 'correction' || Boolean(change.correction_metadata), `${change.event_id}: correction metadata is required.`);
  }
  checks.canonical_fixture.passed = fixturePassed; if (!fixturePassed) checks.canonical_fixture.errors.push('Canonical synthetic fixture did not pass.');
  checks.negative_tests.passed = negativeTestsPassed; if (!negativeTestsPassed) checks.negative_tests.errors.push('Negative test suite did not pass.');
  return { passed: checkNames.every((name) => checks[name]?.passed), checks };
}
