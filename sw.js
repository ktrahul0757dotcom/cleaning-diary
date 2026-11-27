const C='cleaning-team-v22';const SHELL=['./','./index.html','./app.js','./ui.css','./app.css','./fonts/noto-malayalam.woff2','./fonts/inter-latin.woff2','./fonts/inter-latin-ext.woff2','./icon.svg','./icon-180.png','./icon-maskable-512.png','./firebase-config.js','./qrcode.js','./feedback.html','./feedback.js','./squad.html','./squad.js','./vendor/html2canvas.min.js','./vendor/jspdf.umd.min.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
// install: bypass the browser HTTP cache (GitHub Pages sends max-age=600) so a new version never caches stale files
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>fetch(new Request(u,{cache:'reload'})).then(res=>{if(res.ok)return c.put(u,res)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('cleaning-team')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')){ // versioned SDK: cache-first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res})));return}
  if(u.origin!==location.origin)return;
  // app files: network-first, always revalidated with the server (no stale HTTP-cache copies); offline -> cached copy
  const nr=r.mode==='navigate'?new Request(r.url,{cache:'no-cache',credentials:'same-origin'}):new Request(r,{cache:'no-cache'});
  e.respondWith(fetch(nr).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))))});
