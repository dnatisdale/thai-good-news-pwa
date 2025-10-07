
import { useEffect } from 'react';
import { addLink, getByUrl } from '@/lib/db';
import AddEditModal from '@/components/AddEditModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isValidHttpsUrl, normalizeUrl } from '@/lib/url';

export default function AddLink() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const u = params.get('url');
    const title = params.get('title') ?? '';
    if (u && isValidHttpsUrl(u)) {
      const normalized = normalizeUrl(u);
      (async () => {
        const exists = await getByUrl(normalized);
        if (!exists) {
          await addLink({ id: crypto.randomUUID(), title: title || normalized, url: normalized, tags: [], language: 'en', createdAt: Date.now(), updatedAt: Date.now(), favorite: false, source: 'share_target' } as any);
        }
        nav('/');
      })();
    }
  }, [params, nav]);

  return (
    <AddEditModal
      onCancel={() => nav('/')}
      onSave={async (data) => {
        await addLink({
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...data
        } as any);
        nav('/');
      }}
    />
  );
}
