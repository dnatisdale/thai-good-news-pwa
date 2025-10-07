import { useEffect, useState } from 'react';

export default function UpdateToast() {
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<ServiceWorkerRegistration>;
      setReg(ce.detail || null);
    };
    window.addEventListener('sw.updated', onUpdate as any);
    return () => window.removeEventListener('sw.updated', onUpdate as any);
  }, []);

  if (!reg) return null;

  const reloadNow = () => {
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    // When the controller changes, the new SW is active — reload to get it.
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true } as any
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] 
                    rounded-2xl shadow bg-neutral-900 text-white 
                    px-4 py-3 flex items-center gap-3">
      <span>New version available.</span>
      <button className="btn btn-primary" onClick={reloadNow}>Reload</button>
      <button className="btn btn-secondary" onClick={() => setReg(null)}>Later</button>
    </div>
  );
}
