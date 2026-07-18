import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const routes=JSON.parse(await readFile(join(root,'route-manifest.json'),'utf8')).routes;
const failures=[];
for(const route of routes){
  const relative=route.replace(/^\//,'');
  const file=join(root,route==='/'?'index.html':relative.endsWith('.html')?relative:relative+'index.html');
  try{
    await access(file); const html=await readFile(file,'utf8');
    for(const match of html.matchAll(/href="([^"]+)"/g)){
      const href=match[1]; if(/^(https?:|mailto:|#)/.test(href)) continue;
      const target=resolve(dirname(file),href.split('#')[0]); try{await access(target)}catch{failures.push(`${route} -> ${href}`)}
    }
  }catch{failures.push(`${route} -> missing route file`)}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`PASS broken-link gate (${routes.length} routes)`);
