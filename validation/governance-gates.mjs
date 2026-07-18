import path from 'node:path';

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
    if(page.limitations_state!=='none_material_known' && !(page.known_limitations?.length)) violations.push(violation('CGS-R07',page.route,'known limitations or explicit none state required'));
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
    if((page.claim_ids?.length??0)>0 && page.limitations_state!=='none_material_known' && !(page.known_limitations?.length)) { structures++; violations.push(violation('EGS-R05',page.route,'claim-bearing page lacks declared boundary')); }
  }
  return {violations,metrics:[metric('prohibited_language_violations_count',violations.filter(v=>v.rule_id==='EGS-R01'||v.rule_id==='EGS-R02').length,'count',0),metric('incomplete_reference_structures_count',structures,'count',0)]};
}

export function technicalGate({routes,pages,assetSizes={}}) {
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
  return {violations,metrics:[
    metric('html_errors_count',violations.filter(v=>['TQS-R01','TQS-R02'].includes(v.rule_id)).length,'count',0),
    metric('accessibility_violations_count',violations.filter(v=>v.rule_id==='TQS-R03').length,'count',0),
    metric('performance_budget_breaches_count',violations.filter(v=>v.rule_id==='TQS-R06').length,'count',0),
    metric('console_errors_count',null,'count',0,{status:'runtime_not_measured'})
  ]};
}
