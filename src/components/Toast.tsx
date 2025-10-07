import { useEffect, useState } from 'react';

type ToastType = 'info' | 'success' | 'error';
type Item = { id: number; message: string; type: ToastType };

export default function Toast() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ message: string; type: ToastType }>;
      const { message, type } = ce.detail || { message: '', type: 'info' as ToastType };
      if (!message) return;
      const id = Date.now() + Math.random();
      setItems(prev => [...prev, { id, message, type }]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 4000);
    };
    window.addEventListener('toast', handler as any);
    return () => window.removeEventListener('toast', handler as any);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] space-y-2">
      {items.map(i => (
        <div
          key={i.id}
          className={
            'rounded-2xl px-4 py-3 shadow text-white ' +
            (i.type === 'success' ? 'bg-green-600'
              : i.type === 'error' ? 'bg-red-600'
              : 'bg-neutral-900')
          }
          role="status"
        >
          {i.message}
        </div>
      ))}
    </div>
  );
}
