// public/service-worker.js

// Don't skip waiting automatically — we'll do it when user clicks "Reload".
self.addEventListener('install', () => { /* keep it minimal */ });

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Allow the app to tell this SW to activate immediately.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Optional: very light offline fallback for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(event.request); }
      catch { return await caches.match('/') || Response.error(); }
    })());
  }
});
