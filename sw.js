/* BeCafé app: keeps the app shell available so it opens quickly; live data always comes from the internet (Firebase). */
const CACHE='becafe-shell-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(r,copy)); } return res; }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))); });

/* Phone notifications for new customer orders (sent by the Firebase function). */
self.addEventListener('push',e=>{
  let d={}; try{ d=e.data?e.data.json():{}; }catch(x){}
  const n=d.data||d.notification||d; const title=n.title||'New order', body=n.body||'Open the app to accept it.';
  e.waitUntil(self.registration.showNotification(title,{ body, tag:n.tag||'becafe-order', renotify:true, icon:'icon-192.png', badge:'icon-192.png', vibrate:[250,120,250,120,250], requireInteraction:true, data:{url:n.url||'./index.html'} }));
});
self.addEventListener('notificationclick',e=>{ e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{ for(const c of cs){ if('focus' in c) return c.focus(); } return self.clients.openWindow((e.notification.data&&e.notification.data.url)||'./index.html'); })); });
