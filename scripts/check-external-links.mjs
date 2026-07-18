import {readFile,mkdir,writeFile} from 'node:fs/promises';
const registry=JSON.parse(await readFile('data/registry.json','utf8'));
const observations=[];
for(const source of registry.sources) {
  const url=source.locator?.url; if(!url) continue;
  let status='temporarily_unavailable',http_status=null,final_url=url,note=null;
  try {
    const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'user-agent':'ETFCTA-Governance-Link-Check/0.1'}});
    http_status=response.status; final_url=response.url;
    if(response.status===404||response.status===410) status='dead';
    else if(response.status===429||response.status===403) status='rate_limited';
    else if(response.status>=500) status='temporarily_unavailable';
    else if(response.ok) status=response.redirected?'redirected':'reachable';
    else status='temporarily_unavailable';
  } catch(error) { note=error.name==='TimeoutError'?'timeout':'network_error'; }
  observations.push({source_id:source.source_id,url,checked_at:new Date().toISOString(),status,http_status,final_url,note,newer_version_status:'not_determined'});
}
await mkdir('artifacts/governance',{recursive:true});
await writeFile('artifacts/governance/external-links.json',`${JSON.stringify({checker_version:'0.1.0',observations},null,2)}\n`);
const counts=Object.groupBy(observations,item=>item.status); console.log(`PASS external link observations (${observations.length}: ${Object.entries(counts).map(([k,v])=>`${k}=${v.length}`).join(', ')})`);
if(observations.some(item=>item.status==='dead')) process.exit(1);
