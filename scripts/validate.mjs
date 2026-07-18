import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const load = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const registry = await load('data/registry.json');
const vocab = await load('spec/vocabularies.json');
const schemaFiles = (await readdir(path.join(root, 'schemas'))).filter((f) => f.endsWith('.schema.json'));
const schemas = Object.fromEntries(await Promise.all(schemaFiles.map(async (file) => [file.split('.')[0], await load(`schemas/${file}`)])));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const collections = { fund: registry.funds, source: registry.sources, evidence: registry.evidence, decision: registry.decisions, change: registry.changes };

assert(registry.release === registry.classification_version, 'Registry and classification versions must match in the founding release.');
assert(new Set(vocab.knowledge_states).size === 5, 'Knowledge-state vocabulary must contain five unique states.');
assert(vocab.change_types.length === 5, 'Change-type vocabulary must distinguish five event causes.');
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
for (const dec of registry.decisions) {
  assert(ids.get(dec.fund_id) === 'fund', `${dec.decision_id}: unknown fund ${dec.fund_id}.`);
  dec.evidence_ids.forEach((id) => assert(ids.get(id) === 'evidence', `${dec.decision_id}: unknown evidence ${id}.`));
}
for (const fund of registry.funds) {
  for (const dim of Object.values(fund.dimensions)) assert(ids.get(dim.decision_id) === 'decision', `${fund.record_id}: unknown decision ${dim.decision_id}.`);
}
for (const change of registry.changes) {
  assert(ids.get(change.fund_id) === 'fund', `${change.event_id}: unknown fund ${change.fund_id}.`);
  change.source_ids.forEach((id) => assert(ids.get(id) === 'source', `${change.event_id}: unknown source ${id}.`));
}

if (errors.length) {
  console.error(`ETFCTA validation failed (${errors.length})\n${errors.map((e) => `- ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`ETFCTA v${registry.release} valid — ${registry.funds.length} funds, ${registry.sources.length} sources, ${registry.evidence.length} evidence records, ${registry.decisions.length} decisions, ${registry.changes.length} change events.`);

