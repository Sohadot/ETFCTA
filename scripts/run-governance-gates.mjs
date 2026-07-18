import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {contentGate,referenceGate,editorialGate,technicalGate,routeToFile} from '../validation/governance-gates.mjs';

const root=process.cwd();
const load=async(file)=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const routeManifest=await load('route-manifest.json');
const manifest=await load('content/content-manifest.json');
const registry=await load('data/registry.json');
const contract=await load('protocol/governance-automation.json');
const pages=new Map();
for(const route of routeManifest.routes) { try { pages.set(route,await readFile(path.join(root,routeToFile(route)),'utf8')); } catch { pages.set(route,null); } }
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const sitemapRoutes=[...sitemap.matchAll(/<loc>https:\/\/etfcta\.com([^<]*)<\/loc>/g)].map(x=>x[1]||'/');
const assets=(await readdir(path.join(root,'assets'))).filter(file=>/\.(css|js)$/.test(file));
const assetSizes=Object.fromEntries(await Promise.all(assets.map(async file=>[`assets/${file}`,(await stat(path.join(root,'assets',file))).size])));
const results={content_governance:contentGate({routes:routeManifest.routes,manifest,registry}),reference_integrity:referenceGate({routes:routeManifest.routes,pages,sitemapRoutes,registry}),editorial_governance:editorialGate({pages,manifest}),technical_quality:technicalGate({routes:routeManifest.routes,pages,assetSizes})};
for(const file of assets.filter(file=>file.endsWith('.js'))) { const body=await readFile(path.join(root,'assets',file),'utf8'); if(/\bconsole\.log\s*\(|\bdebugger\b|sourceMappingURL=/.test(body)) results.technical_quality.violations.push({rule_id:'TQS-R07',entity_id:`assets/${file}`,message:'console-producing or debug pattern'}); }
for(const file of assets.filter(file=>file.endsWith('.css'))) { const body=await readFile(path.join(root,'assets',file),'utf8'); if((body.match(/{/g)||[]).length!==(body.match(/}/g)||[]).length) results.technical_quality.violations.push({rule_id:'TQS-R04',entity_id:`assets/${file}`,message:'unbalanced CSS blocks'}); }
let commit_sha='unknown'; try { commit_sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(); } catch {}
const evaluated_at=new Date().toISOString(); await mkdir(path.join(root,'artifacts/governance'),{recursive:true}); let failed=false;
for(const [gate_id,result] of Object.entries(results)) { const report={contract_version:contract.version,gate_id,checker_version:'0.1.0',commit_sha,evaluated_at,result:result.violations.length?'fail':'pass',metrics:result.metrics,violations:result.violations,artifact_path:`artifacts/governance/${gate_id.replaceAll('_','-')}.json`}; await writeFile(path.join(root,report.artifact_path),`${JSON.stringify(report,null,2)}\n`); console.log(`${report.result==='pass'?'PASS':'FAIL'} ${gate_id} (${report.metrics.length} metrics, ${report.violations.length} violations)`); for(const item of report.violations) console.error(`  ${item.rule_id} ${item.entity_id}: ${item.message}`); failed ||= report.result==='fail'; }
if(failed) process.exit(1);
