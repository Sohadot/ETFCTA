import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { runFixtureSuite } from '../tests/fixture-suite.mjs';

const root=process.cwd(); const load=async(file)=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const schemaFiles=(await readdir(path.join(root,'schemas'))).filter((file)=>file.endsWith('.schema.json'));
const schemas=Object.fromEntries(await Promise.all(schemaFiles.map(async(file)=>[file.split('.')[0],await load(`schemas/${file}`)])));
const context={schemas,rules:await load('protocol/rules.json'),reviewWindows:await load('protocol/review-windows.json'),vocab:await load('spec/vocabularies.json'),ontology:await load('reference/ontology.json'),glossary:await load('reference/glossary.json'),releaseGate:await load('protocol/release-gate.json')};
const suite=await runFixtureSuite(context,root);
console.log(`${suite.validPassed?'PASS':'FAIL'} canonical synthetic chain`);
for(const result of suite.results) console.log(`${result.passed?'PASS':'FAIL'} rejects ${result.name} (${result.expectedCheck})`);
if(!suite.validPassed||!suite.negativePassed) process.exit(1);

