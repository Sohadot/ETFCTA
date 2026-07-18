import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const roots=['schemas','protocol','knowledge','data']; const singles=['route-manifest.json','sitemap.xml','llms.txt','reference/glossary.json','reference/ontology.json'];
const files=[]; async function walk(dir){for(const name of await readdir(dir)){const file=path.posix.join(dir.replaceAll('\\','/'),name);const info=await stat(file);if(info.isDirectory())await walk(file);else if(/\.(json|md|xml|txt)$/.test(name))files.push(file);}}
for(const root of roots) await walk(root); files.push(...singles); const unique=[...new Set(files)].sort();
const digest=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
if(process.argv.includes('--check')) { const manifest=JSON.parse(await readFile('integrity/manifest.json','utf8')); const errors=[]; for(const record of manifest.files){try{if(await digest(record.path)!==record.sha256)errors.push(record.path);}catch{errors.push(record.path);}} if(errors.length){errors.forEach(file=>console.error(`FAIL integrity ${file}`));process.exit(1);} console.log(`PASS file integrity (${manifest.files.length} governed files)`); }
else { const records=[]; for(const file of unique) records.push({path:file,sha256:await digest(file)}); await mkdir('integrity',{recursive:true}); await writeFile('integrity/manifest.json',`${JSON.stringify({version:'0.1.0',algorithm:'sha256',files:records},null,2)}\n`); console.log(`WROTE integrity manifest (${records.length} files)`); }
