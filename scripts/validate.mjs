import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { validateRegistry } from '../validation/registry-validator.mjs';
import { runFixtureSuite } from '../tests/fixture-suite.mjs';

const root = process.cwd();
const load = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const schemaFiles = (await readdir(path.join(root, 'schemas'))).filter((file) => file.endsWith('.schema.json'));
const schemas = Object.fromEntries(await Promise.all(schemaFiles.map(async (file) => [file.split('.')[0], await load(`schemas/${file}`)])));
const context = {
  schemas,
  rules: await load('protocol/rules.json'), reviewWindows: await load('protocol/review-windows.json'),
  vocab: await load('spec/vocabularies.json'), ontology: await load('reference/ontology.json'),
  glossary: await load('reference/glossary.json'), releaseGate: await load('protocol/release-gate.json')
};
const fixtures = await runFixtureSuite(context, root);
const report = validateRegistry({ registry: await load('data/registry.json'), ...context, fixturePassed: fixtures.validPassed, negativeTestsPassed: fixtures.negativePassed });

for (const name of context.releaseGate.required_checks) {
  const check = report.checks[name];
  console.log(`${check?.passed ? 'PASS' : 'FAIL'} ${name}`);
  for (const error of check?.errors ?? []) console.log(`  - ${error}`);
}
console.log(context.releaseGate.production_admission_authorized ? `AUTHORIZED ${context.releaseGate.sprint_0d_status}.` : 'BLOCKED — production admission remains unauthorized.');
if (!report.passed) process.exit(1);
console.log('ETFCTA release gate passed. Public registry contains exactly two funds: KMLM and DBMF.');
