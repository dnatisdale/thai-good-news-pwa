export function setupSWUpdate() {
  if (!('serviceWorker' in navigator)) return;

  // TEMP: disable SW in production to rule out stale cache
  if (import.meta.env.PROD && window.location.hostname !== 'localhost') {
    return;
  }

  window.addEventListener('load', async () => {
    // ... keep the rest of your registration code here ...


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
