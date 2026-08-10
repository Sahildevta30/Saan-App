const CACHE_NAME = 'saan-cache-v1';
const APP_SHELL = ['/Saan-App/', '/Saan-App/index.html', '/Saan-App/manifest.json', '/Saan-App/icon-192.png', '/Saan-App/icon-512.png'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(APP_SHELL); }).catch(function(){})
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

/* Network-first for the app shell so updates (backend/UI changes) show up
   automatically next time the app is opened, with a cached fallback for
   offline use. Firebase requests always go straight to the network. */
self.addEventListener('fetch', function(event){
  const url = event.request.url;
  if(url.indexOf('firebase') !== -1 || url.indexOf('googleapis') !== -1 || url.indexOf('gstatic') !== -1){
    return; // let these pass through untouched
  }
  event.respondWith(
    fetch(event.request)
      .then(function(res){
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
        return res;
      })
      .catch(function(){ return caches.match(event.request); })
  );
});
