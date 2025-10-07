// src/lib/blankGuard.ts
(function () {
  function showOverlay(message: string) {
    try {
      const wrap = document.createElement('div');
      wrap.style.position = 'fixed';
      wrap.style.left = '50%';
      wrap.style.bottom = '24px';
      wrap.style.transform = 'translateX(-50%)';
      wrap.style.zIndex = '999999';
      wrap.style.maxWidth = '90vw';
      wrap.style.background = '#b91c1c';
      wrap.style.color = 'white';
      wrap.style.padding = '12px 16px';
      wrap.style.borderRadius = '12px';
      wrap.style.boxShadow = '0 8px 24px rgba(0,0,0,.25)';
      wrap.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      wrap.style.whiteSpace = 'pre-wrap';
      wrap.textContent = 'App error: ' + message;
      document.body.appendChild(wrap);
    } catch { /* ignore */ }
  }

  window.addEventListener('error', (e) => {
    if (e?.message) showOverlay(e.message);
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const r: any = e.reason;
    const msg =
      (r && (r.message || r.toString && r.toString())) ||
      'Unhandled promise rejection';
    showOverlay(String(msg));
  });

  // If React never mounts, show a hint after 2s.
  setTimeout(() => {
    const root = document.getElementById('root');
    if (root && root.childElementCount === 0) {
      showOverlay('Root not mounted. Check console for the first error.');
    }
  }, 2000);
})();
