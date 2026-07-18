import { readFile } from 'node:fs/promises';
import process from 'node:process';

const contract = JSON.parse(await readFile('protocol/governance-automation.json', 'utf8'));
const expected = ['content_governance','reference_integrity','knowledge_consistency','evidence_governance','ontology_governance','editorial_governance','technical_quality','security_supply_chain','release_governance'];
const errors = [];
const fail = (condition, message) => { if (!condition) errors.push(message); };

fail(contract.contract_id === 'GAL-001', 'contract_id must be GAL-001');
fail(/^\d+\.\d+\.\d+$/.test(contract.version), 'contract version must be semantic');
fail(contract.fail_closed === true, 'GAL must fail closed');
fail(JSON.stringify(contract.gate_order) === JSON.stringify(expected), 'gate order must contain the nine canonical layers');
fail(Array.isArray(contract.required_report_fields) && contract.required_report_fields.includes('metrics') && contract.required_report_fields.includes('violations'), 'report contract must require metrics and violations');
fail(contract.gates?.length === expected.length, 'exactly nine gates are required');

const ids = contract.gates?.map((gate) => gate.id) ?? [];
fail(new Set(ids).size === ids.length, 'gate IDs must be unique');
for (const gate of contract.gates ?? []) {
  fail(expected.includes(gate.id), `unknown gate: ${gate.id}`);
  fail(contract.allowed_states.includes(gate.state), `${gate.id}: invalid state`);
  fail(/^4[BCD]$/.test(gate.sprint), `${gate.id}: invalid delivery sprint`);
  fail(typeof gate.owner_role === 'string' && gate.owner_role.length > 0, `${gate.id}: owner role required`);
  fail(Array.isArray(gate.checks) && gate.checks.length > 0, `${gate.id}: checks required`);
  fail(Array.isArray(gate.metrics) && gate.metrics.length > 0, `${gate.id}: metrics required`);
  fail(new Set(gate.checks).size === gate.checks.length, `${gate.id}: duplicate checks`);
  fail(new Set(gate.metrics).size === gate.metrics.length, `${gate.id}: duplicate metrics`);
}
const allMetrics = (contract.gates ?? []).flatMap((gate) => gate.metrics);
fail(new Set(allMetrics).size === allMetrics.length, 'metric IDs must be globally unique');

if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exit(1);
}
console.log(`PASS governance automation contract (${contract.gates.length} gates, ${allMetrics.length} metrics)`);
