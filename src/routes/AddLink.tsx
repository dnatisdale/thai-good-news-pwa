// src/routes/AddLink.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { normalizeUrl } from '@/lib/url';
import { importMany } from '@/lib/db';
import type { SavedLink } from '@/types';

export default function AddLink() {
  const { t, lang } = useI18n();
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState<'en' | 'th'>(lang);

  const onCancel = () => nav('/');

  const onSave = async () => {
    try {
      if (!url.trim()) { toast('URL is required', 'error'); return; }
      const finalUrl = normalizeUrl(url.trim());

      let finalTitle = title.trim();
      if (!finalTitle) {
        try { finalTitle = new URL(finalUrl).hostname.replace(/^www\./i, ''); }
        catch { finalTitle = finalUrl; }
      }

      const newLink: SavedLink = {
        id: crypto.randomUUID(),
        title: finalTitle,
        url: finalUrl,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
        language,
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'manual'
      };

      const res = await importMany([newLink]); // reuse bulk import to insert one
      if (res.added > 0) {
        toast(t('copied') || 'Saved', 'success');
        nav('/');
      } else {
        toast('Duplicate or not saved', 'error');
      }
    } catch (e: any) {
      toast(e?.message ?? String(e), 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('add_link_form_title')}</h1>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">{t('field_title')}</span>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">{t('field_url')}</span>
          <input className="input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">{t('field_tags')}</span>
          <input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="news, thailand, culture" />
          <span className="text-xs opacity-60">Comma-separated</span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">{t('field_notes')}</span>
          <textarea className="input min-h-[96px]" value={notes} onChange={e=>setNotes(e.target.value)} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">{t('field_language')}</span>
          <select className="input w-44" value={language} onChange={e=>setLanguage(e.target.value as 'en'|'th')}>
            <option value="en">English</option>
            <option value="th">ไทย (Thai)</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn btn-primary" onClick={onSave}>{t('btn_save')}</button>
        <button className="btn btn-secondary" onClick={onCancel}>{t('btn_cancel')}</button>
      </div>
    </div>
  );
}
