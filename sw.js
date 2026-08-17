const V='wc-3e8c091d', FONTS='wc-fonts';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==FONTS).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  if(new URL(req.url).hostname.indexOf('fonts.g')>-1){
    e.respondWith(caches.open(FONTS).then(c=>c.match(req).then(hit=>
      hit||fetch(req).then(res=>{c.put(req,res.clone());return res}).catch(()=>hit))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>
    hit||fetch(req).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error())));
});