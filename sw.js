const V='wc-68b13c57', FONTS='wc-fonts';
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
  // 本体(HTML)はネットワーク優先。オンラインなら必ず最新を表示し、圏外のときだけキャッシュを使う
  if(req.mode==='navigate'||(req.destination==='document')){
    // GitHub Pages は max-age=600 を返すので、no-store でブラウザのHTTPキャッシュを迂回する
    e.respondWith(fetch(req.url,{cache:'no-store'}).then(res=>{
      const copy=res.clone(); caches.open(V).then(c=>c.put('./index.html',copy)); return res;
    }).catch(()=>caches.match('./index.html',{ignoreSearch:true}).then(hit=>hit||caches.match('./'))));
    return;
  }
  if(new URL(req.url).hostname.indexOf('fonts.g')>-1){
    e.respondWith(caches.open(FONTS).then(c=>c.match(req).then(hit=>
      hit||fetch(req).then(res=>{c.put(req,res.clone());return res}).catch(()=>hit))));
    return;
  }
  // アイコンなどはキャッシュ優先
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).catch(()=>Response.error())));
});