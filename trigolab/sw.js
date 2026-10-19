/* Service worker: guarda los archivos de TrigoLab para abrirla sin conexión después de la primera visita.
   Estrategia "red primero": si hay internet se usa siempre la versión publicada; si no, la copia guardada. */
'use strict';
const CACHE='trigolab-v1';
const ASSETS=['./','./index.html','./style.css','./math.js','./motion.js','./app.js','./classroom.js','./comparison.js','./manifest.webmanifest','./icono.svg','./icono-192.png','./icono-512.png','./juego.js','./vendor/three.min.js'];
const known=ASSETS.map(path=>new URL(path,self.registration.scope).pathname);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==location.origin||!known.includes(url.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||(event.request.mode==='navigate'?caches.match(new URL('./',self.registration.scope).href):Response.error()))));
});
