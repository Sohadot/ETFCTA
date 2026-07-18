import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const load = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const registry = await load('data/registry.json');
const vocab = await load('spec/vocabularies.json');
const ontology = await load('reference/ontology.json');
const glossary = await load('reference/glossary.json');
const ruleRegistry = await load('protocol/rules.json');
const reviewWindows = await load('protocol/review-windows.json');
const releaseGate = await load('protocol/release-gate.json');
const schemaFiles = (await readdir(path.join(root, 'schemas'))).filter((f) => f.endsWith('.schema.json'));
const schemas = Object.fromEntries(await Promise.all(schemaFiles.map(async (file) => [file.split('.')[0], await load(`schemas/${file}`)])));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const collections = { fund: registry.funds, source: registry.sources, evidence: registry.evidence, decision: registry.decisions, change: registry.changes };

assert(registry.release === registry.classification_version, 'Registry and classification versions must match in the founding release.');
assert(registry.evidence_protocol === 'EAP-001' && registry.evidence_protocol_version === '0.1.0', 'Registry must identify the active evidence protocol.');
assert(new Set(vocab.knowledge_states).size === 5, 'Knowledge-state vocabulary must contain five unique states.');
assert(vocab.change_types.length === 5, 'Change-type vocabulary must distinguish five event causes.');
assert(JSON.stringify(ontology.layers.change) === JSON.stringify(vocab.change_types), 'Change ontology and controlled vocabulary must agree.');
assert(new Set(glossary.terms.map((term) => term.term_id)).size === glossary.terms.length, 'Glossary term IDs must be unique.');
assert(new Set(glossary.terms.map((term) => term.route)).size === glossary.terms.length, 'Glossary routes must be unique.');
for (const term of glossary.terms) {
  assert(term.definition && term.data_fields.length && term.route.startsWith('/reference/'), `${term.term_id}: incomplete canonical term.`);
}
assert(reviewWindows.default_days > 0, 'Default review window must be positive.');
assert(releaseGate.required_checks.length >= 10, 'Sprint 0B release gate is incomplete.');
for (const [name, schema] of Object.entries(schemas)) {
  assert(schema.additionalProperties === false, `${name} schema must reject undeclared top-level fields.`);
  assert(Array.isArray(schema.required) && schema.required.length > 0, `${name} schema must define required fields.`);
}

const ids = new Map();
const idField = { fund: 'record_id', source: 'source_id', evidence: 'evidence_id', decision: 'decision_id', change: 'event_id' };
for (const [kind, records] of Object.entries(collections)) {
  assert(Array.isArray(records), `${kind} collection must be an array.`);
  for (const record of records) {
    const id = record[idField[kind]];
    assert(id && !ids.has(id), `Duplicate or missing ${kind} ID: ${id ?? '(missing)'}.`);
    ids.set(id, kind);
    for (const required of schemas[kind].required) assert(Object.hasOwn(record, required), `${id}: missing ${required}.`);
  }
}

for (const ev of registry.evidence) assert(ids.get(ev.source_id) === 'source', `${ev.evidence_id}: unknown source ${ev.source_id}.`);
const allowedTransitions = {
  candidate: ['identity_verified', 'rejected'], identity_verified: ['preserved', 'rejected'],
  preserved: ['extracted', 'rejected'], extracted: ['admitted', 'rejected'],
  admitted: ['withdrawn', 'superseded'], rejected: [], withdrawn: [], superseded: []
};
for (const source of registry.sources) {
  const preservation = source.preservation;
  assert(preservation?.status !== 'preserved' || /^[a-f0-9]{64}$/.test(preservation.document_sha256 ?? ''), `${source.source_id}: preserved source requires SHA-256.`);
  assert(preservation?.status !== 'preservation_unavailable' || preservation.limitation, `${source.source_id}: preservation limitation is required.`);
}
for (const ev of registry.evidence) {
  const history = ev.admission?.history ?? [];
  assert(history.at(-1)?.state === ev.admission?.state, `${ev.evidence_id}: current admission state must equal final history state.`);
  for (let i = 1; i < history.length; i++) assert(allowedTransitions[history[i - 1].state]?.includes(history[i].state), `${ev.evidence_id}: invalid admission transition ${history[i - 1].state} → ${history[i].state}.`);
}
for (const dec of registry.decisions) {
  assert(ids.get(dec.fund_id) === 'fund', `${dec.decision_id}: unknown fund ${dec.fund_id}.`);
  dec.evidence_ids.forEach((id) => {
    assert(ids.get(id) === 'evidence', `${dec.decision_id}: unknown evidence ${id}.`);
    const evidence = registry.evidence.find((item) => item.evidence_id === id);
    assert(evidence?.admission?.state === 'admitted', `${dec.decision_id}: evidence ${id} is not admitted.`);
  });
  const rule = ruleRegistry.rules.find((item) => item.rule_id === dec.rule_id && item.version === dec.rule_version);
  assert(Boolean(rule), `${dec.decision_id}: active rule ${dec.rule_id} v${dec.rule_version} not found.`);
  assert(dec.decision_status !== 'confirmed' || dec.sufficiency_result === 'pass', `${dec.decision_id}: confirmed requires passing sufficiency.`);
  assert(dec.decision_status !== 'withdrawn' || dec.sufficiency_result !== 'pass', `${dec.decision_id}: withdrawn decision cannot retain passing sufficiency.`);
  assert(Date.parse(dec.review_due) > Date.parse(dec.decided_at), `${dec.decision_id}: review date must follow decision date.`);
}
for (const fund of registry.funds) {
  for (const dim of Object.values(fund.dimensions)) assert(ids.get(dim.decision_id) === 'decision', `${fund.record_id}: unknown decision ${dim.decision_id}.`);
}
for (const change of registry.changes) {
  assert(ids.get(change.fund_id) === 'fund', `${change.event_id}: unknown fund ${change.fund_id}.`);
  change.source_ids.forEach((id) => assert(ids.get(id) === 'source', `${change.event_id}: unknown source ${id}.`));
  if (change.previous_decision_id) assert(ids.get(change.previous_decision_id) === 'decision', `${change.event_id}: unknown previous decision.`);
  if (change.new_decision_id) assert(ids.get(change.new_decision_id) === 'decision', `${change.event_id}: unknown new decision.`);
  assert(change.previous_value !== change.new_value || change.previous_decision_id !== change.new_decision_id, `${change.event_id}: change event must preserve a material state transition.`);
}

if (errors.length) {
  console.error(`ETFCTA validation failed (${errors.length})\n${errors.map((e) => `- ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`ETFCTA v${registry.release} valid — ${registry.funds.length} funds, ${registry.sources.length} sources, ${registry.evidence.length} evidence records, ${registry.decisions.length} decisions, ${registry.changes.length} change events.`);
