// src/routes/AddLink.tsx
import { useEffect } from 'react';
import { addLink, getByUrl, updateLink } from '@/lib/db';
import AddEditModal from '@/components/AddEditModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isValidHttpsUrl, normalizeUrl } from '@/lib/url';

export default function AddLink() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  // Handle Android share_target GET params (optional)
  useEffect(() => {
    const u = params.get('url');
    const title = params.get('title') ?? '';
    if (u && isValidHttpsUrl(u)) {
      const normalized = normalizeUrl(u);
      (async () => {
        const exists = await getByUrl(normalized);
        if (!exists) {
          const now = Date.now();
          await addLink({
            id: crypto.randomUUID(),
            title: title || new URL(normalized).hostname.replace(/^www\./i, ''),
            url: normalized,
            tags: [],
            language: 'en',
            createdAt: now,
            updatedAt: now,
            favorite: false,
            source: 'share_target'
          } as any);
        }
        nav('/');
      })().catch(err => {
        console.error(err);
        alert('Failed to save via share target. See console for details.');
      });
    }
  }, [params, nav]);

  return (
    <AddEditModal
      onCancel={() => nav('/')}
      onSave={async (data) => {
        try {
          const finalUrl = normalizeUrl(data.url);
          if (!isValidHttpsUrl(finalUrl)) {
            alert('Please enter a valid https:// URL.');
            return;
          }
          const now = Date.now();
          const exists = await getByUrl(finalUrl);

          if (exists) {
            await updateLink(exists.id, {
              title: data.title,
              url: finalUrl,
              tags: data.tags,
              notes: data.notes,
              language: data.language,
              updatedAt: now
            });
          } else {
            await addLink({
              id: crypto.randomUUID(),
              title: data.title,
              url: finalUrl,
              tags: data.tags,
              notes: data.notes,
              language: data.language,
              favorite: false,
              createdAt: now,
              updatedAt: now,
              source: 'manual'
            } as any);
          }

          nav('/');
        } catch (err: any) {
          console.error(err);
          alert(`Save failed: ${err?.message ?? err}`);
        }
      }}
    />
  );
}
