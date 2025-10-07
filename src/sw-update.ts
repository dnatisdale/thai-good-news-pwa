// src/sw-update.ts
export function setupSWUpdate() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

      // Check periodically (every 60s) while the page is open.
      setInterval(() => reg.update(), 60_000);

      // When a new SW is found, wait until it's installed and controlled → then announce.
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          const isInstalled = newWorker.state === 'installed';
          const alreadyControlled = Boolean(navigator.serviceWorker.controller);
          if (isInstalled && alreadyControlled) {
            window.dispatchEvent(new CustomEvent('sw.updated', { detail: reg }));
          }
        });
      });
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });
}
