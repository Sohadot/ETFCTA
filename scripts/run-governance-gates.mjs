import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import {contentGate,referenceGate,editorialGate,technicalGate,knowledgeConsistencyGate,ontologyGovernanceGate,evidenceGovernanceGate,securitySupplyChainGate,releaseGovernanceGate,routeToFile} from '../validation/governance-gates.mjs';

const root=process.cwd();
const load=async(file)=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const routeManifest=await load('route-manifest.json');
const manifest=await load('content/content-manifest.json');
const registry=await load('data/registry.json');
const contract=await load('protocol/governance-automation.json');
const terms=await load('knowledge/term-registry.json'); const locks=await load('knowledge/definition-locks.json'); const claims=await load('knowledge/claim-registry.json'); const relationships=await load('knowledge/relationship-registry.json'); const glossary=await load('reference/glossary.json'); const rules=await load('protocol/rules.json'); const methodologyGaps=await load('data/methodology-gaps.json');
const releaseGate=await load('protocol/release-gate.json'); const policy=await load('security/supply-chain-policy.json'); const licenses=await load('security/license-manifest.json'); const packageJson=await load('package.json');
let externalLinks={observations:[]}; try{externalLinks=await load('artifacts/governance/external-links.json');}catch{}
const pages=new Map();
for(const route of routeManifest.routes) { try { pages.set(route,await readFile(path.join(root,routeToFile(route)),'utf8')); } catch { pages.set(route,null); } }
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const sitemapRoutes=[...sitemap.matchAll(/<loc>https:\/\/etfcta\.com([^<]*)<\/loc>/g)].map(x=>x[1]||'/');
const assets=(await readdir(path.join(root,'assets'))).filter(file=>/\.(css|js)$/.test(file));
const assetSizes=Object.fromEntries(await Promise.all(assets.map(async file=>[`assets/${file}`,(await stat(path.join(root,'assets',file))).size])));
const tracked=execFileSync('git',['ls-files','-co','--exclude-standard'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean); const files={}; for(const file of tracked.filter(x=>/\.(?:json|md|mjs|js|html|css|xml|txt|yml|yaml)$/.test(x))){try{files[file]=await readFile(file,'utf8');}catch{}}
const publicNames=new Set([...routeManifest.routes.map(routeToFile),'data/changes.json','data/evidence-status.json','data/methodology-gaps.json','data/review-calendar.json','data/funds/kmlm.json','data/funds/dbmf.json']); const publicFiles=Object.fromEntries(Object.entries(files).filter(([file])=>publicNames.has(file)));
let integrityFailures=[]; let integrityManifestHash=null; try{const raw=await readFile('integrity/manifest.json'); integrityManifestHash=createHash('sha256').update(raw).digest('hex'); const integrity=JSON.parse(raw); for(const record of integrity.files){try{const hash=createHash('sha256').update(await readFile(record.path)).digest('hex');if(hash!==record.sha256)integrityFailures.push(record.path);}catch{integrityFailures.push(record.path);}}}catch{integrityFailures=['integrity/manifest.json'];}
const workflows=Object.entries(files).filter(([file])=>/^\.github\/workflows\/.+\.ya?ml$/.test(file));
const results={content_governance:contentGate({routes:routeManifest.routes,manifest,registry}),reference_integrity:referenceGate({routes:routeManifest.routes,pages,sitemapRoutes,registry}),knowledge_consistency:knowledgeConsistencyGate({routes:routeManifest.routes,pages,manifest,terms,locks,claims,glossary,registry,methodologyGaps}),evidence_governance:evidenceGovernanceGate({registry,externalLinks}),ontology_governance:ontologyGovernanceGate({relationships,terms,registry,rules,manifest}),editorial_governance:editorialGate({pages,manifest}),technical_quality:technicalGate({routes:routeManifest.routes,pages,assetSizes,manifest}),security_supply_chain:securitySupplyChainGate({files,publicFiles,packageJson,policy,licenses,integrityFailures,workflows})};
for(const file of assets.filter(file=>file.endsWith('.js'))) { const body=await readFile(path.join(root,'assets',file),'utf8'); if(/\bconsole\.log\s*\(|\bdebugger\b|sourceMappingURL=/.test(body)) results.technical_quality.violations.push({rule_id:'TQS-R07',entity_id:`assets/${file}`,message:'console-producing or debug pattern'}); }
for(const file of assets.filter(file=>file.endsWith('.css'))) { const body=await readFile(path.join(root,'assets',file),'utf8'); if((body.match(/{/g)||[]).length!==(body.match(/}/g)||[]).length) results.technical_quality.violations.push({rule_id:'TQS-R04',entity_id:`assets/${file}`,message:'unbalanced CSS blocks'}); }
let commit_sha='unknown'; try { commit_sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(); } catch {}
const evaluated_at=new Date().toISOString(); await mkdir(path.join(root,'artifacts/governance'),{recursive:true}); let failed=false;
for(const [gate_id,result] of Object.entries(results)) { const report={contract_version:contract.version,gate_id,checker_version:'0.1.0',commit_sha,evaluated_at,result:result.violations.length?'fail':'pass',metrics:result.metrics,violations:result.violations,artifact_path:`artifacts/governance/${gate_id.replaceAll('_','-')}.json`}; await writeFile(path.join(root,report.artifact_path),`${JSON.stringify(report,null,2)}\n`); console.log(`${report.result==='pass'?'PASS':'FAIL'} ${gate_id} (${report.metrics.length} metrics, ${report.violations.length} violations)`); for(const item of report.violations) console.error(`  ${item.rule_id} ${item.entity_id}: ${item.message}`); failed ||= report.result==='fail'; }
if(!process.env.GAL_PRE_ATTESTATION) {
  const artifactHashes={}; for(const id of Object.keys(results)){const raw=await readFile(`artifacts/governance/${id.replaceAll('_','-')}.json`);artifactHashes[id]=createHash('sha256').update(raw).digest('hex');}
  let attestation=null; try{attestation=await load(`governance-attestations/site-${routeManifest.site_release}.json`);}catch{}
  let expectedSubject=commit_sha; if(attestation&&attestation.subject_commit_sha!==commit_sha){try{const parent=execFileSync('git',['rev-parse','HEAD^'],{encoding:'utf8'}).trim();const changed=execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r','HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);if(parent===attestation.subject_commit_sha&&changed.length===1&&changed[0]===`governance-attestations/site-${routeManifest.site_release}.json`)expectedSubject=parent;}catch{}}
  let releaseArchive=null; try{releaseArchive=await readFile(`releases/site-${routeManifest.site_release}.md`,'utf8');}catch{}
  const releaseResult=releaseGovernanceGate({contract,releaseGate,routeManifest,changelog:await readFile('CHANGELOG.md','utf8'),decisionLog:await readFile('governance/DECISION_LOG.md','utf8'),releaseArchive,attestation,artifactHashes,integrityManifestHash,subjectCommitSha:expectedSubject});
  const gate_id='release_governance'; const report={contract_version:contract.version,gate_id,checker_version:'0.1.0',commit_sha,evaluated_at,result:releaseResult.violations.length?'fail':'pass',metrics:releaseResult.metrics,violations:releaseResult.violations,artifact_path:'artifacts/governance/release-governance.json'}; await writeFile(report.artifact_path,`${JSON.stringify(report,null,2)}\n`); console.log(`${report.result==='pass'?'PASS':'FAIL'} ${gate_id} (${report.metrics.length} metrics, ${report.violations.length} violations)`); for(const item of report.violations) console.error(`  ${item.rule_id} ${item.entity_id}: ${item.message}`); failed ||= report.result==='fail';
}
if(failed) process.exit(1);
