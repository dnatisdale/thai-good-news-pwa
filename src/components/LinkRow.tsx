import type { SavedLink } from '@/types';
import { useState, useMemo } from 'react';
import { t } from '@/lib/i18n';
import { hostFromUrl } from '@/lib/url';
import QRCodeModal from './QRCodeModal';

export default function LinkRow({
  item,
  onToggleFav,
  onEdit,
  onDelete
}: {
  item: SavedLink;
  onToggleFav: (id: string, next: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [qr, setQr] = useState(false);
  const host = useMemo(() => hostFromUrl(item.url), [item.url]);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: item.url, text: item.notes });
      } else {
        await navigator.clipboard.writeText(item.url);
        alert(t('copied'));
      }
    } catch {}
  }

  return (
    <div className="w-full rounded-xl px-3 py-2 bg-white dark:bg-neutral-800 border dark:border-neutral-700 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary px-2 py-1 min-w-[44px] min-h-[34px]"
            aria-label={item.favorite ? t('unfavorite') : t('favorite')}
            title={item.favorite ? t('unfavorite') : t('favorite')}
            onClick={() => onToggleFav(item.id, !item.favorite)}
          >
            {item.favorite ? '★' : '☆'}
          </button>
          <a
            className="font-medium truncate max-w-[52vw] sm:max-w-[60vw] lg:max-w-[40vw] underline text-blue-600"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.url}
          >
            {item.title}
          </a>
        </div>
        <div className="text-xs opacity-70 mt-1 truncate">
          {host} {item.tags.length ? '· ' : ''}{item.tags.map((t, i) => `#${t}${i < item.tags.length - 1 ? ' ' : ''}`)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <button className="btn btn-secondary min-h-[34px]" onClick={() => setQr(true)}>QR</button>
        <button className="btn btn-secondary min-h-[34px]" onClick={share}>{t('share')}</button>
        <button className="btn btn-secondary min-h-[34px]" onClick={() => onEdit(item.id)}>{t('edit')}</button>
        <button
          className="btn btn-secondary min-h-[34px]"
          onClick={() => onDelete(item.id)}
        >
          {t('delete')}
        </button>
      </div>

      {qr && <QRCodeModal url={item.url} onClose={() => setQr(false)} />}
    </div>
  );
}
