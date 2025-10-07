// src/sw-update.ts
export function setupSWUpdate() {
  if (!('serviceWorker' in navigator)) return;

  // Set to true to temporarily disable the SW on production while debugging.
  const DISABLE_SW_IN_PROD = false;
  if (DISABLE_SW_IN_PROD && import.meta.env.PROD && window.location.hostname !== 'localhost') {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((reg) => {
        // Poll for updates every 60s while the tab is open
        setInterval(() => reg.update(), 60_000);

        // When a new SW is installed and the page is already controlled,
        // announce it so the UI can show a "Reload" button.
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            const isInstalled = nw.state === 'installed';
            const alreadyControlled = Boolean(navigator.serviceWorker.controller);
            if (isInstalled && alreadyControlled) {
              window.dispatchEvent(new CustomEvent('sw.updated', { detail: reg }));
            }
          });
        });
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  });
}
