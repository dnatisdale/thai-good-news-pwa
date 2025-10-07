
import { useEffect, useMemo, useState } from 'react';
import type { SavedLink } from '@/types';
import { getAll, updateLink, removeLink } from '@/lib/db';
import LinkCard from '@/components/LinkCard';
import AddEditModal from '@/components/AddEditModal';
import { t } from '@/lib/i18n';

export default function Home() {
  const [items, setItems] = useState<SavedLink[]>([]);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'all' | 'en' | 'th'>('all');
  const [favsOnly, setFavsOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  async function load() { setItems(await getAll()); }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter(i => (lang === 'all' || i.language === lang))
      .filter(i => (favsOnly ? i.favorite : true))
      .filter(i => (tagFilter ? i.tags.includes(tagFilter) : true))
      .filter(i => [i.title, i.url, i.tags.join(','), i.notes ?? '', new URL(i.url).host].join(' ').toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, query, lang, favsOnly, tagFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input className="input flex-1" placeholder={t('search')} value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="input w-40" value={lang} onChange={e=>setLang(e.target.value as any)} aria-label={t('language_filter')}>
          <option value="all">All</option>
          <option value="en">EN</option>
          <option value="th">TH</option>
        </select>
        <input className="input w-40" placeholder={t('tag_filter')} value={tagFilter} onChange={e=>setTagFilter(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={favsOnly} onChange={e=>setFavsOnly(e.target.checked)} />
          <span>{t('favorite_filter')}</span>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p>{t('no_data')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(item => (
            <LinkCard
              key={item.id}
              item={item}
              onToggleFav={async (id, next) => { await updateLink(id, { favorite: next }); load(); }}
              onEdit={(id) => setEditing(id)}
              onDelete={async (id) => { if (confirm('Delete?')) { await removeLink(id); load(); } }}
            />
          ))}
        </div>
      )}

      {editing && (
        <AddEditModal
          initial={items.find(i=>i.id===editing)!}
          onCancel={()=>setEditing(null)}
          onSave={async (data)=>{ /* could add update logic here */ setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
