import {contentGate,referenceGate,editorialGate,technicalGate} from '../validation/governance-gates.mjs';
const registry={funds:[{fund_id:'ETFCTA-FUND-TEST'}],sources:[{source_id:'SRC-TEST'}],evidence:[{evidence_id:'EVD-TEST',source_id:'SRC-TEST',admission:{state:'admitted'}}],decisions:[{decision_id:'DEC-TEST',dimension:'strategy_family',evidence_ids:['EVD-TEST']}]};
const defaults={content_status:'published',reviewed_at:'2026-07-18',review_due:'2027-07-18',limitations_state:'none_material_known',known_limitations:[],quotes:[],editorial_exceptions:[]};
const baseManifest={defaults,pages:[{route:'/',claim_ids:['DEC-TEST']},{route:'/child/',claim_ids:[]}]};
const basePages=new Map([['/','<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Home</title><link rel="canonical" href="https://etfcta.com/"></head><body><h1>Home</h1><a href="child/">Child</a></body></html>'],['/child/','<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Child</title><link rel="canonical" href="https://etfcta.com/child/"></head><body><h1>Child</h1></body></html>']]);
const routes=['/','/child/']; const sitemapRoutes=[...routes];
const cases=[
['claim without evidence','CGS-R03',()=>contentGate({routes,manifest:baseManifest,registry:{...registry,decisions:[{decision_id:'DEC-TEST',dimension:'strategy_family',evidence_ids:[]}]}})],
['quote without locator','CGS-R05',()=>contentGate({routes,manifest:{...baseManifest,pages:[{route:'/',claim_ids:[],quotes:[{text:'quoted'}]},baseManifest.pages[1]]},registry})],
['page without review date','CGS-R06',()=>contentGate({routes,manifest:{...baseManifest,defaults:{...defaults,reviewed_at:null}},registry})],
['orphan route','RIS-R02',()=>referenceGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('<a href="child/">Child</a>',''):h])),sitemapRoutes,registry})],
['duplicate canonical','RIS-R03',()=>referenceGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/child/'?h.replace('https://etfcta.com/child/','https://etfcta.com/'):h])),sitemapRoutes,registry})],
['sitemap mismatch','RIS-R04',()=>referenceGate({routes,pages:basePages,sitemapRoutes:['/'],registry})],
['route missing HTML','RIS-R01',()=>referenceGate({routes,pages:new Map([['/',basePages.get('/')]]),sitemapRoutes,registry})],
['invalid JSON-LD','RIS-R05',()=>referenceGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('</head>','<script type="application/ld+json">{bad}</script></head>'):h])),sitemapRoutes,registry})],
['recommendation language','EGS-R01',()=>editorialGate({pages:new Map([['/','<p>Recommended for investors.</p>'],['/child/','']]),manifest:baseManifest})],
['broken heading hierarchy','TQS-R02',()=>technicalGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('<h1>Home</h1>','<h1>Home</h1><h3>Skip</h3>'):h]))})],
['image without alt','TQS-R03',()=>technicalGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('</body>','<img src="x.png"></body>'):h]))})],
['duplicate HTML ID','TQS-R02',()=>technicalGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('</body>','<p id="x"></p><p id="x"></p></body>'):h]))})],
['performance budget','TQS-R06',()=>technicalGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?`${h}${'x'.repeat(132000)}`:h]))})],
['external dependency','TQS-R05',()=>technicalGate({routes,pages:new Map([...basePages].map(([r,h])=>[r,r==='/'?h.replace('</head>','<script src="https://cdn.example/a.js"></script></head>'):h]))})]
];
let failed=false; for(const [name,rule,run] of cases) { const found=run().violations.some(item=>item.rule_id===rule); console.log(`${found?'PASS':'FAIL'} rejects ${name} (${rule})`); failed ||= !found; } if(failed) process.exit(1);
