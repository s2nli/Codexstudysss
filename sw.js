const V='codexstudys-hub-v3';
const CORE=['./','index.html','style.css','app.js','data.js','manifest.json','logo-64.png','logo-192.png','logo-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('codexstudys-hub-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; const u=new URL(r.url); if(r.method!=='GET'||u.origin!==location.origin||/^\/(pw|pi|nt|mj|kgs|un|ac|rwa|gs|sf|vidyakul|padhle|iq|cw|fk|teria|vb|pinnacle|rg|gb|md|tb|officer|yes|cds|sw|sachin|master|aash|sarvam|vg|sm|mm|vm|kd|uc|pr|cbse|table|api|functions)\//.test(u.pathname)) return;
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
