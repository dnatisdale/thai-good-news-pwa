// public/service-worker.js
self.addEventListener('install', () => { /* minimal */ });

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Lightweight offline fallback for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(event.request); }
      catch { return await caches.match('/') || Response.error(); }
    })());
  }
});
