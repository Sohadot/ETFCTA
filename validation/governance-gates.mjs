import path from 'node:path';
import {createHash} from 'node:crypto';

export const routeToFile = (route) => route === '/' ? 'index.html' : route.endsWith('/') ? `${route.slice(1)}index.html` : route.slice(1);
const metric = (metric_id, value, unit, target, extra={}) => ({metric_id,value,unit,target,...extra});
const violation = (rule_id, entity_id, message) => ({rule_id,entity_id,message});
const fullPage = (page, defaults) => ({...defaults,...page});

export function contentGate({routes, manifest, registry}) {
  const violations=[]; const pages=manifest.pages.map((page)=>fullPage(page,manifest.defaults));
  const decisions=new Map(registry.decisions.map((item)=>[item.decision_id,item]));
  const evidence=new Map(registry.evidence.map((item)=>[item.evidence_id,item]));
  const sources=new Set(registry.sources.map((item)=>item.source_id));
  const byRoute=new Map(); pages.forEach((page)=>(byRoute.get(page.route)??byRoute.set(page.route,[]).get(page.route)).push(page));
  for(const route of routes) {
    const found=byRoute.get(route)??[];
    if(found.length!==1) violations.push(violation('CGS-R01',route,`expected one content manifest entry; found ${found.length}`));
  }
  for(const page of pages) {
    if(page.content_status!=='published') violations.push(violation('CGS-R01',page.route,'public route must be published'));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(page.reviewed_at??'')) violations.push(violation('CGS-R06',page.route,'reviewed_at is required'));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(page.review_due??'')) violations.push(violation('CGS-R06',page.route,'review_due is required'));
    if(page.limitations_state!=='none_material_known' && !(page.known_limitations?.length) && !(page.global_limitations?.length)) violations.push(violation('CGS-R07',page.route,'known limitations or explicit none state required'));
    for(const quote of page.quotes??[]) if(!quote.locator) violations.push(violation('CGS-R05',page.route,'quotation requires locator'));
    for(const id of page.claim_ids??[]) {
      const decision=decisions.get(id);
      if(!decision) { violations.push(violation('CGS-R02',id,'claim ID must resolve to a typed classification decision')); continue; }
      if(!decision.dimension) violations.push(violation('CGS-R02',id,'claim has no knowledge type'));
      if(!decision.evidence_ids?.length) violations.push(violation('CGS-R03',id,'claim has no evidence'));
      for(const evidenceId of decision.evidence_ids??[]) {
        const record=evidence.get(evidenceId);
        if(!record || record.admission?.state!=='admitted') violations.push(violation('CGS-R03',id,`evidence ${evidenceId} is not admitted`));
        else if(!record.source_id || !sources.has(record.source_id)) violations.push(violation('CGS-R04',evidenceId,'evidence has no resolved source'));
      }
    }
  }
  const claimCount=pages.reduce((n,page)=>n+(page.claim_ids?.length??0),0);
  const linkedClaims=claimCount-violations.filter((item)=>item.rule_id==='CGS-R03').length;
  const quoteCount=pages.reduce((n,page)=>n+(page.quotes?.length??0),0);
  return {violations,metrics:[
    metric('claims_linked_to_evidence_pct',claimCount?linkedClaims/claimCount*100:100,'percent',100,{numerator:linkedClaims,denominator:claimCount}),
    metric('quotes_with_locator_pct',quoteCount?(quoteCount-violations.filter(v=>v.rule_id==='CGS-R05').length)/quoteCount*100:100,'percent',100,{numerator:quoteCount-violations.filter(v=>v.rule_id==='CGS-R05').length,denominator:quoteCount}),
    metric('pages_with_review_date_pct',(pages.length-violations.filter(v=>v.rule_id==='CGS-R06').length)/pages.length*100,'percent',100,{denominator:pages.length}),
    metric('pages_with_known_limitations_pct',(pages.length-violations.filter(v=>v.rule_id==='CGS-R07').length)/pages.length*100,'percent',100,{denominator:pages.length})
  ]};
}

const canonicalFor=(route)=>`https://etfcta.com${route}`;
const stripFragment=(href)=>href.split('#')[0].split('?')[0];
export function referenceGate({routes,pages,sitemapRoutes,registry}) {
  const violations=[]; const canonicals=new Map(); const incoming=new Map(routes.map(route=>[route,0]));
  const knownIds=new Set([...registry.funds.map(x=>x.record_id),...registry.sources.map(x=>x.source_id),...registry.evidence.map(x=>x.evidence_id),...registry.decisions.map(x=>x.decision_id)]);
  for(const route of routes) {
    const html=pages.get(route);
    if(!html) { violations.push(violation('RIS-R01',route,'route has no HTML file')); continue; }
    const canonical=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
    if(canonical!==canonicalFor(route)) violations.push(violation('RIS-R03',route,`canonical must equal ${canonicalFor(route)}`));
    if(canonical) { if(canonicals.has(canonical)) violations.push(violation('RIS-R03',route,`duplicate canonical with ${canonicals.get(canonical)}`)); else canonicals.set(canonical,route); }
    for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) try { JSON.parse(block[1]); } catch { violations.push(violation('RIS-R05',route,'invalid JSON-LD')); }
    for(const id of html.match(/(?:DEC|EVD|SRC|ETFCTA-FUND)-[A-Z0-9-]+/g)??[]) if(!knownIds.has(id)) violations.push(violation('RIS-R06',route,`unknown governed ID ${id}`));
    for(const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
      const href=stripFragment(match[1]); if(!href) continue;
      if(/^https?:\/\//i.test(href)) { if(!/^https:\/\//i.test(href)) violations.push(violation('RIS-R07',route,`external link must use HTTPS: ${href}`)); continue; }
      if(/^(mailto:|#)/i.test(href)||href.endsWith('.json')||href.endsWith('.md')||href.endsWith('.csv')||href.endsWith('.pdf')) continue;
      const base=new URL(canonicalFor(route)); const target=new URL(href,base); let targetRoute=target.pathname.endsWith('.html')?target.pathname:target.pathname.endsWith('/')?target.pathname:`${target.pathname}/`; targetRoute=targetRoute.replace(/\/index\.html$/,'/') || '/';
      if(incoming.has(targetRoute)) incoming.set(targetRoute,incoming.get(targetRoute)+1);
      else if(targetRoute.endsWith('.html')&&!routes.includes(targetRoute)) violations.push(violation('RIS-R02',route,`internal route is not admitted: ${targetRoute}`));
    }
  }
  for(const route of routes.filter(route=>route!=='/')) if((incoming.get(route)??0)===0) violations.push(violation('RIS-R02',route,'orphan route has no incoming internal link'));
  const routeSet=new Set(routes), sitemapSet=new Set(sitemapRoutes);
  for(const route of new Set([...routeSet,...sitemapSet])) if(!routeSet.has(route)||!sitemapSet.has(route)) violations.push(violation('RIS-R04',route,'sitemap and route manifest disagree'));
  return {violations,metrics:[
    metric('broken_internal_links_count',violations.filter(v=>v.rule_id==='RIS-R01'||(v.rule_id==='RIS-R02'&&!v.message.startsWith('orphan'))).length,'count',0),
    metric('broken_external_links_count',null,'count',0,{status:'not_measured'}),
    metric('orphan_pages_count',violations.filter(v=>v.rule_id==='RIS-R02'&&v.message.startsWith('orphan')).length,'count',0),
    metric('canonical_compliance_pct',(routes.length-violations.filter(v=>v.rule_id==='RIS-R03').length)/routes.length*100,'percent',100,{denominator:routes.length}),
    metric('structured_data_compliance_pct',violations.some(v=>v.rule_id==='RIS-R05')?0:100,'percent',100)
  ]};
}

const visibleText=(html)=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
const prohibited=['best','guaranteed','safe','protects','will outperform','suitable for','recommended'];
export function editorialGate({pages,manifest}) {
  const violations=[]; let structures=0;
  for(const page of manifest.pages.map(p=>fullPage(p,manifest.defaults))) {
    const text=visibleText(pages.get(page.route)??'').toLowerCase();
    for(const phrase of prohibited) {
      let index=text.indexOf(phrase);
      while(index>=0) {
        const context=text.slice(Math.max(0,index-45),index);
        const negated=/(does not|do not|not|never|no)\b[^.]{0,35}$/.test(context);
        const excepted=(page.editorial_exceptions??[]).some(x=>x.phrase===phrase&&x.rationale&&x.reviewer);
        if(!negated&&!excepted) violations.push(violation(phrase==='recommended'||phrase==='suitable for'?'EGS-R01':'EGS-R02',page.route,`unqualified phrase: ${phrase}`));
        index=text.indexOf(phrase,index+phrase.length);
      }
    }
    if((page.claim_ids?.length??0)>0 && page.limitations_state!=='none_material_known' && !(page.known_limitations?.length) && !(page.global_limitations?.length) && !(page.page_specific_limitations?.length)) { structures++; violations.push(violation('EGS-R05',page.route,'claim-bearing page lacks declared boundary')); }
  }
  return {violations,metrics:[metric('prohibited_language_violations_count',violations.filter(v=>v.rule_id==='EGS-R01'||v.rule_id==='EGS-R02').length,'count',0),metric('incomplete_reference_structures_count',structures,'count',0)]};
}

export function technicalGate({routes,pages,assetSizes={},manifest}) {
  const violations=[];
  for(const route of routes) {
    const html=pages.get(route)??'';
    for(const [pattern,label] of [[/^<!doctype html>/i,'doctype'],[/<html\b[^>]*lang=/i,'language'],[/<head[\s>]/i,'head'],[/<body[\s>]/i,'body'],[/<title>[^<]+<\/title>/i,'title'],[/<meta\b[^>]*name=["']viewport["']/i,'viewport']]) if(!pattern.test(html)) violations.push(violation('TQS-R01',route,`missing ${label}`));
    const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(x=>x[1]); for(const id of new Set(ids)) if(ids.filter(x=>x===id).length>1) violations.push(violation('TQS-R02',route,`duplicate ID ${id}`));
    const headings=[...html.matchAll(/<h([1-6])\b/gi)].map(x=>Number(x[1])); if(headings[0]!==1) violations.push(violation('TQS-R02',route,'first heading must be h1')); for(let i=1;i<headings.length;i++) if(headings[i]>headings[i-1]+1) violations.push(violation('TQS-R02',route,`heading skips h${headings[i-1]} to h${headings[i]}`));
    for(const img of html.matchAll(/<img\b[^>]*>/gi)) if(!/\balt=["'][^"']*["']/i.test(img[0])) violations.push(violation('TQS-R03',route,'image missing alt'));
    for(const input of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) if(!/\b(aria-label|aria-labelledby|id)=["']/i.test(input[0])) violations.push(violation('TQS-R03',route,'form control missing accessible name'));
    for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) try { JSON.parse(block[1]); } catch { violations.push(violation('TQS-R04',route,'invalid JSON-LD')); }
    for(const tag of html.matchAll(/<script\b[^>]*src=["'](https?:\/\/[^"']+)/gi)) violations.push(violation('TQS-R05',route,`unapproved third-party dependency ${tag[1]}`));
    for(const tag of html.matchAll(/<link\b(?=[^>]*rel=["']stylesheet["'])[^>]*href=["'](https?:\/\/[^"']+)/gi)) violations.push(violation('TQS-R05',route,`unapproved third-party dependency ${tag[1]}`));
    if(Buffer.byteLength(html)>131072) violations.push(violation('TQS-R06',route,'HTML exceeds 128 KiB'));
  }
  for(const [file,size] of Object.entries(assetSizes)) { const limit=file.endsWith('.css')?163840:131072; if(size>limit) violations.push(violation('TQS-R06',file,`asset exceeds ${limit} bytes`)); }
  if(manifest) {
    const descriptions=new Map();
    for(const page of manifest.pages.filter(x=>['fund_dossier','comparison','evidence_status','methodology_gap','deep_reference'].includes(x.page_type))) { const description=(pages.get(page.route)??'').match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)/i)?.[1]; if(!description) violations.push(violation('TQS-R01',page.route,'indexable reference page requires meta description')); else if(descriptions.has(description)) violations.push(violation('TQS-R01',page.route,`duplicate meta description with ${descriptions.get(description)}`)); else descriptions.set(description,page.route); }
  }
  return {violations,metrics:[
    metric('html_errors_count',violations.filter(v=>['TQS-R01','TQS-R02'].includes(v.rule_id)).length,'count',0),
    metric('accessibility_violations_count',violations.filter(v=>v.rule_id==='TQS-R03').length,'count',0),
    metric('performance_budget_breaches_count',violations.filter(v=>v.rule_id==='TQS-R06').length,'count',0),
    metric('console_errors_count',null,'count',0,{status:'runtime_not_measured'})
  ]};
}

export function knowledgeConsistencyGate({routes,pages,manifest,terms,locks,claims,glossary,registry,methodologyGaps}) {
  const violations=[]; const ids=new Set(); const labels=new Map(); const definitions=new Map();
  for(const term of terms.terms) {
    if(ids.has(term.term_id)) violations.push(violation('KCS-R01',term.term_id,'duplicate term ID')); ids.add(term.term_id);
    const label=term.canonical_label.toLowerCase(); if(labels.has(label)&&labels.get(label)!==term.term_id) violations.push(violation('KCS-R01',term.term_id,'duplicate canonical label')); labels.set(label,term.term_id);
    if(definitions.has(term.definition)&&definitions.get(term.definition)!==term.term_id) violations.push(violation('KCS-R01',term.term_id,'duplicate canonical definition')); definitions.set(term.definition,term.term_id);
    if(!routes.includes(term.publication_route)) violations.push(violation('KCS-R04',term.term_id,'publication route is not admitted'));
    else if(!visibleText(pages.get(term.publication_route)??'').includes(term.definition)) violations.push(violation('KCS-R02',term.term_id,'published definition does not match canonical definition'));
  }
  const aliasOwners=new Map();
  for(const term of terms.terms) for(const alias of term.aliases??[]) { const normalized=alias.toLowerCase(); const labelOwner=labels.get(normalized); if((labelOwner&&labelOwner!==term.term_id)||(aliasOwners.has(normalized)&&aliasOwners.get(normalized)!==term.term_id)) violations.push(violation('KCS-R04',term.term_id,`alias is not uniquely approved: ${alias}`)); aliasOwners.set(normalized,term.term_id); }
  const glossaryById=new Map(glossary.terms.map(x=>[x.term_id,x]));
  for(const term of terms.terms) { const shared=glossaryById.get(term.term_id); if(!shared||shared.definition!==term.definition||shared.label!==term.canonical_label) violations.push(violation('KCS-R03',term.term_id,'glossary and canonical registry disagree')); }
  const lockById=new Map(locks.locks.map(x=>[x.term_id,x]));
  for(const term of terms.terms) { const hash=createHash('sha256').update(term.definition).digest('hex'); const lock=lockById.get(term.term_id); if(!lock||lock.sha256!==hash||lock.term_version!==term.version) { const migrated=locks.migrations.some(x=>x.term_id===term.term_id&&x.to_version===term.version&&x.decision_log_id); if(!migrated) violations.push(violation('KCS-R05',term.term_id,'definition changed without migration')); } }
  const pageByRoute=new Map(manifest.pages.map(page=>[page.route,fullPage(page,manifest.defaults)]));
  const claimById=new Map(claims.claims.map(x=>[x.claim_id,x]));
  const derive=(claim)=>claim.derivation==='count(funds)'?registry.funds.length:claim.derivation==='count(changes where change_type=initial_admission)'?registry.changes.filter(x=>x.change_type==='initial_admission').length:claim.derivation==='count(changes where change_type!=initial_admission)'?registry.changes.filter(x=>x.change_type!=='initial_admission').length:claim.derivation==='count(gaps)'?methodologyGaps.gaps.length:undefined;
  for(const claim of claims.claims) {
    if(!claims.allowed_claim_types.includes(claim.claim_type)||!claim.publication_routes?.length||!claim.derived_from?.length) violations.push(violation('KCS-R06',claim.claim_id,'claim type, basis, and publication routes are required'));
    const actual=derive(claim); if(actual===undefined||actual!==claim.expected_value) violations.push(violation('KCS-R07',claim.claim_id,`derived value ${actual} does not equal ${claim.expected_value}`));
    for(const route of claim.publication_routes??[]) { const page=pageByRoute.get(route); if(!page||(page.general_claim_ids??[]).includes(claim.claim_id)===false) violations.push(violation('KCS-R06',claim.claim_id,`route ${route} does not declare claim`)); const rendered=claim.rendered_values_by_route?.[route]??claim.rendered_value; if(!visibleText(pages.get(route)??'').includes(rendered)) violations.push(violation('KCS-R07',claim.claim_id,`rendered value missing from ${route}`)); }
  }
  for(const page of pageByRoute.values()) {
    for(const id of page.general_claim_ids??[]) if(!claimById.has(id)) violations.push(violation('KCS-R06',id,`unknown claim on ${page.route}`));
    for(const id of page.term_ids??[]) if(!ids.has(id)) violations.push(violation('KCS-R04',id,`unregistered term on ${page.route}`));
    if(['fund_dossier','comparison','evidence_status','methodology_gap','deep_reference'].includes(page.page_type) && !(page.page_specific_limitations?.length)) violations.push(violation('KCS-R08',page.route,'page-specific limitation required'));
  }
  return {violations,metrics:[metric('duplicate_definitions_count',violations.filter(v=>v.rule_id==='KCS-R01'||v.rule_id==='KCS-R02'||v.rule_id==='KCS-R03').length,'count',0),metric('unknown_terms_count',violations.filter(v=>v.rule_id==='KCS-R04').length,'count',0),metric('unlogged_definition_changes_count',violations.filter(v=>v.rule_id==='KCS-R05').length,'count',0)]};
}

export function ontologyGovernanceGate({relationships,terms,registry,rules,manifest}) {
  const violations=[]; const entities=new Map(); const add=(id,kind)=>{ if(entities.has(id)) violations.push(violation('OGS-R04',id,'duplicate entity ID')); entities.set(id,kind); };
  registry.funds.forEach(x=>add(x.record_id,'fund')); registry.decisions.forEach(x=>add(x.decision_id,'decision')); registry.evidence.forEach(x=>add(x.evidence_id,'evidence')); registry.sources.forEach(x=>add(x.source_id,'source')); rules.rules.forEach(x=>add(x.rule_id,'rule')); terms.terms.forEach(x=>add(x.term_id,'term')); relationships.entity_extensions.forEach(x=>add(x.entity_id,x.kind));
  const types=new Map(); for(const type of relationships.relation_types) { if(types.has(type.relation_type)) violations.push(violation('OGS-R04',type.relation_type,'duplicate relationship type')); types.set(type.relation_type,type); }
  const relIds=new Set();
  for(const rel of relationships.relationships) {
    if(relIds.has(rel.relationship_id)) violations.push(violation('OGS-R04',rel.relationship_id,'duplicate relationship ID')); relIds.add(rel.relationship_id);
    const type=types.get(rel.relation_type); if(!type) { violations.push(violation('OGS-R01',rel.relationship_id,'relationship type is not allowed')); continue; }
    const subjectKind=entities.get(rel.subject_id), objectKind=entities.get(rel.object_id); if(!subjectKind||!objectKind) violations.push(violation('OGS-R02',rel.relationship_id,'relationship endpoint does not resolve')); else if(subjectKind!==type.subject_kind||objectKind!==type.object_kind) violations.push(violation('OGS-R03',rel.relationship_id,'relationship endpoint kinds do not match signature'));
    if(rel.relation_type==='governed_by') { const decision=registry.decisions.find(x=>x.decision_id===rel.subject_id); if(decision&&decision.rule_id!==rel.object_id) violations.push(violation('OGS-R06',rel.relationship_id,'decision is linked to the wrong governing rule')); }
  }
  const fundByTicker=new Map(registry.funds.map(x=>[x.ticker.toLowerCase(),x.record_id]));
  for(const page of manifest.pages.filter(x=>/^\/funds\/[^/]+\/$/.test(x.route))) { const ticker=page.route.split('/')[2]; const owner=fundByTicker.get(ticker); for(const id of page.claim_ids??[]) { const decision=registry.decisions.find(x=>x.decision_id===id); if(decision&&decision.fund_id!==owner) violations.push(violation('OGS-R06',id,`decision does not belong to ${owner}`)); } }
  for(const entity of relationships.entity_extensions) if(entity.previous_ids?.length&&!relationships.entity_migrations.some(x=>x.entity_id===entity.entity_id&&x.decision_log_id)) violations.push(violation('OGS-R05',entity.entity_id,'entity rename lacks migration'));
  return {violations,metrics:[metric('undefined_terms_count',violations.filter(v=>v.rule_id==='OGS-R02').length,'count',0),metric('invalid_relationships_count',violations.filter(v=>['OGS-R01','OGS-R03','OGS-R06'].includes(v.rule_id)).length,'count',0),metric('unmigrated_entity_renames_count',violations.filter(v=>v.rule_id==='OGS-R05').length,'count',0)]};
}
