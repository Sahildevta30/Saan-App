const CACHE_NAME = 'saan-cache-v5';
const APP_SHELL = ['/Saan-App/', '/Saan-App/index.html', '/Saan-App/manifest.json', '/Saan-App/icon-192.png', '/Saan-App/icon-512.png'];

/* ---------------- FIREBASE CLOUD MESSAGING (background push) ---------------- */
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDhXpwowPhfXdnBcXCHvtS2ZVYxpZNFfRM",
  authDomain: "saan-app-3f55a.firebaseapp.com",
  databaseURL: "https://saan-app-3f55a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "saan-app-3f55a",
  storageBucket: "saan-app-3f55a.firebasestorage.app",
  messagingSenderId: "212508232863",
  appId: "1:212508232863:web:c2d5a1a5769f976aa926aa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload){
  const title = (payload.notification && payload.notification.title) || 'Saan';
  const body = (payload.notification && payload.notification.body) || 'New message';
  self.registration.showNotification(title, {
    body: body,
    icon: '/Saan-App/icon-192.png',
    tag: 'saan-msg'
  });
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList){
      for (const c of clientList) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/Saan-App/');
    })
  );
});

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
    fetch(event.request, { cache: 'no-store' })
      .then(function(res){
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
        return res;
      })
      .catch(function(){ return caches.match(event.request); })
  );
});
