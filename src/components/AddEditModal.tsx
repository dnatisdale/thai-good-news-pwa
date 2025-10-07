import { useEffect, useMemo, useState } from 'react';
import type { SavedLink } from '@/types';
import { isValidHttpsUrl, normalizeUrl, sanitizeText, hostFromUrl } from '@/lib/url';
import { t } from '@/lib/i18n';

interface Props {
  initial?: Partial<SavedLink>;
  onCancel: () => void;
  onSave: (data: Omit<SavedLink, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => void;
}

export default function AddEditModal({ initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [language, setLanguage] = useState<'en' | 'th'>(initial?.language ?? 'en');

  // compute once per render
  const normalized = useMemo(() => normalizeUrl(url), [url]);
  const valid = useMemo(() => isValidHttpsUrl(url), [url]);

  // If user leaves title empty but URL is valid, suggest a title from the host
  useEffect(() => {
    if (!title.trim() && valid) {
      const guess = hostFromUrl(url);
      if (guess) setTitle(guess);
    }
  }, [valid, url, title]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="card w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-4">{initial?.id ? t('edit') : t('add_link')}</h2>

        <label className="label">{t('title')}</label>
        <input
          className="input"
          value={title}
          onChange={e => setTitle(sanitizeText(e.target.value))}
          aria-label="Title"
        />

        <label className="label mt-3">{t('url')}</label>
        <input
          className="input"
          value={url}
          onChange={e => setUrl(e.target.value)}
          aria-invalid={!valid && !!url}
          aria-describedby="url-help"
          aria-label="URL"
          placeholder="example.com/article (we will force https://)"
        />
        {!valid && url && (
          <p id="url-help" className="text-red-600 text-sm">{t('validate_https')}</p>
        )}
        {valid && normalized !== url && (
          <p className="text-sm opacity-70">Will save as <code>{normalized}</code></p>
        )}

        <label className="label mt-3">{t('tags')}</label>
        <input className="input" value={tags} onChange={e => setTags(sanitizeText(e.target.value))} />

        <label className="label mt-3">{t('notes')}</label>
        <textarea className="input" value={notes} onChange={e => setNotes(sanitizeText(e.target.value))} rows={3} />

        <div className="mt-3 flex gap-3 items-center">
          <span className="label m-0">{t('language')}</span>
          <select className="input" value={language} onChange={e => setLanguage(e.target.value as 'en'|'th')}>
            <option value="en">{t('english')}</option>
            <option value="th">{t('thai')}</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>{t('cancel')}</button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => {
              const finalUrl = normalizeUrl(url);
              const finalTitle = title.trim() || hostFromUrl(url) || finalUrl;
              onSave({
                id: initial?.id,
                title: finalTitle,
                url: finalUrl,
                tags: tags.split(',').map(s => s.trim()).filter(Boolean),
                notes: notes.trim() || undefined,
                language,
                favorite: Boolean(initial?.favorite),
                source: initial?.source ?? 'manual'
              });
            }}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
