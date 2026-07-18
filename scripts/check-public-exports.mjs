import { readFile } from 'node:fs/promises';
import { findPublicExportLeaks, validatePublicExportShape } from '../validation/public-export-validator.mjs';
import { validateSchema } from '../validation/schema-subset.mjs';
const paths=['data/funds/kmlm.json','data/funds/dbmf.json'];
const schema=JSON.parse(await readFile('schemas/public-export.schema.json','utf8'));
for(const path of paths){const value=JSON.parse(await readFile(path,'utf8'));const errors=[...validateSchema(value,schema,path),...validatePublicExportShape(value)];if(errors.length){console.error(`${path}\n${errors.join('\n')}`);process.exit(1)}}
const releasePath='data/releases/0.4.0.json';
const releaseValue=JSON.parse(await readFile(releasePath,'utf8'));
const releaseErrors=findPublicExportLeaks(releaseValue);
if(releaseValue.projection_schema!=='ETFCTA-PUBLIC-RELEASE-001-v0.1.0') releaseErrors.push('$.projection_schema: invalid public release projection');
if(releaseErrors.length){console.error(`${releasePath}\n${releaseErrors.join('\n')}`);process.exit(1)}
for(const path of ['data/changes.json','data/review-calendar.json']){const value=JSON.parse(await readFile(path,'utf8'));const errors=findPublicExportLeaks(value);if(errors.length){console.error(`${path}\n${errors.join('\n')}`);process.exit(1)}}
const forbiddenSamples=['%TEMP%/archive','C:\\Users\\name\\archive','file:///archive','restricted-local:archive','http://localhost/archive','http://127.0.0.1/archive'];
for(const sample of forbiddenSamples){const fixture={projection_schema:'ETFCTA-PUBLIC-EXPORT-001-v0.1.0',sources:[],probe:sample};if(validatePublicExportShape(fixture).length===0){console.error(`Negative test failed: ${sample}`);process.exit(1)}}
console.log(`PASS public export boundary (${paths.length + 3} exports, ${forbiddenSamples.length} negative tests)`);
