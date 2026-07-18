import {readFile} from 'node:fs/promises';
import {knowledgeConsistencyGate,ontologyGovernanceGate,routeToFile} from '../validation/governance-gates.mjs';
const load=async file=>JSON.parse(await readFile(file,'utf8'));
const [routeManifest,manifest,terms,locks,claims,relationships,glossary,registry,rules,methodologyGaps]=await Promise.all(['route-manifest.json','content/content-manifest.json','knowledge/term-registry.json','knowledge/definition-locks.json','knowledge/claim-registry.json','knowledge/relationship-registry.json','reference/glossary.json','data/registry.json','protocol/rules.json','data/methodology-gaps.json'].map(load));
const pages=new Map(); for(const route of routeManifest.routes) pages.set(route,await readFile(routeToFile(route),'utf8'));
const kcs=(overrides={})=>knowledgeConsistencyGate({routes:routeManifest.routes,pages,manifest,terms,locks,claims,glossary,registry,methodologyGaps,...overrides});
const ogs=(overrides={})=>ontologyGovernanceGate({relationships,terms,registry,rules,manifest,...overrides});
const cases=[
  ['conflicting definitions','KCS-R01',()=>{const value=structuredClone(terms); value.terms.push({...value.terms[0],term_id:'TERM-CONFLICT',definition:'Conflicting definition.'}); return kcs({terms:value});}],
  ['unregistered term','KCS-R04',()=>{const value=structuredClone(manifest); value.pages[0].term_ids=['TERM-UNKNOWN']; return kcs({manifest:value});}],
  ['unapproved alias','KCS-R04',()=>{const value=structuredClone(terms); value.terms[0].aliases.push('implementation route'); return kcs({terms:value});}],
  ['unallowed relationship','OGS-R01',()=>{const value=structuredClone(relationships); value.relationships.push({relationship_id:'REL-BAD',subject_id:'ETFCTA-FUND-US-KMLM',relation_type:'recommends',object_id:'STRATEGY-TREND-FOLLOWING'}); return ogs({relationships:value});}],
  ['definition change without migration','KCS-R05',()=>{const value=structuredClone(terms); value.terms[0].definition='Changed without governance.'; return kcs({terms:value});}],
  ['incorrect derived count','KCS-R07',()=>{const value=structuredClone(claims); value.claims[0].expected_value=12; return kcs({claims:value});}],
  ['foreign fund decision','OGS-R06',()=>{const value=structuredClone(manifest); value.pages.find(x=>x.route==='/funds/kmlm/').claim_ids.push('DEC-DBMF-RM-001'); return ogs({manifest:value});}],
  ['generic limitation only','KCS-R08',()=>{const value=structuredClone(manifest); value.pages.find(x=>x.route==='/reference/signal-horizon/').page_specific_limitations=[]; return kcs({manifest:value});}]
];
let failed=false; for(const [name,rule,run] of cases) { const found=run().violations.some(item=>item.rule_id===rule); console.log(`${found?'PASS':'FAIL'} rejects ${name} (${rule})`); failed ||= !found; } if(failed) process.exit(1);
