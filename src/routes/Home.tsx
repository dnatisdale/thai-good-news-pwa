import { useEffect, useMemo, useState } from 'react';
import type { SavedLink } from '@/types';
import { getAll, updateLink, removeLink } from '@/lib/db';
import LinkCard from '@/components/LinkCard';
import LinkRow from '@/components/LinkRow';
import AddEditModal from '@/components/AddEditModal';
import { t } from '@/lib/i18n';

type ViewMode = 'cards' | 'compact';
type SortBy = 'date_desc' | 'date_asc' | 'title_asc' | 'host_asc' | 'fav_first';

export default function Home() {
  const [items, setItems] = useState<SavedLink[]>([]);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'all' | 'en' | 'th'>('all');
  const [favsOnly, setFavsOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  // NEW: layout controls
  const [view, setView] = useState<ViewMode>('cards');
  const [showList, setShowList] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortBy>('date_desc');

  async function load() { setItems(await getAll()); }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter(i => (lang === 'all' || i.language === lang))
      .filter(i => (favsOnly ? i.favorite : true))
      .filter(i => (tagFilter ? i.tags.includes(tagFilter) : true))
      .filter(i =>
        [i.title, i.url, i.tags.join(','), i.notes ?? '', (() => { try { return new URL(i.url).host; } catch { return ''; } })()]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
  }, [items, query, lang, favsOnly, tagFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'date_desc':
        arr.sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
        break;
      case 'date_asc':
        arr.sort((a, b) => (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt));
        break;
      case 'title_asc':
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'host_asc':
        const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./i, ''); } catch { return ''; } };
        arr.sort((a, b) => host(a.url).localeCompare(host(b.url)));
        break;
      case 'fav_first':
        arr.sort((a, b) => Number(b.favorite) - Number(a.favorite));
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
        <input className="input flex-1" placeholder={t('search')} value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="input sm:w-40" value={lang} onChange={e=>setLang(e.target.value as any)} aria-label={t('language_filter')}>
          <option value="all">All</option>
          <option value="en">EN</option>
          <option value="th">TH</option>
        </select>
        <input className="input sm:w-40" placeholder={t('tag_filter')} value={tagFilter} onChange={e=>setTagFilter(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={favsOnly} onChange={e=>setFavsOnly(e.target.checked)} />
          <span>{t('favorite_filter')}</span>
        </label>
      </div>

      {/* NEW: layout & sorting row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button className="btn btn-secondary" onClick={() => setShowList(s => !s)}>
          {showList ? 'Hide list' : 'Show list'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">View</span>
          <button
            className={`btn btn-secondary ${view === 'cards' ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setView('cards')}
          >
            Cards
          </button>
          <button
            className={`btn btn-secondary ${view === 'compact' ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setView('compact')}
          >
            Compact
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Sort</span>
          <select className="input w-48" value={sortBy} onChange={e=>setSortBy(e.target.value as SortBy)}>
            <option value="date_desc">Date (newest)</option>
            <option value="date_asc">Date (oldest)</option>
            <option value="title_asc">Title (A→Z)</option>
            <option value="host_asc">Host (A→Z)</option>
            <option value="fav_first">Favorites first</option>
          </select>
        </div>
      </div>

      {/* List */}
      {!showList ? (
        <p className="opacity-70">List hidden. Click “Show list” to display.</p>
      ) : sorted.length === 0 ? (
        <p>{t('no_data')}</p>
      ) : view === 'cards' ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map(item => (
            <LinkCard
              key={item.id}
              item={item}
              onToggleFav={async (id, next) => { await updateLink(id, { favorite: next }); load(); }}
              onEdit={(id) => setEditing(id)}
              onDelete={async (id) => {
                const host = (() => { try { return new URL(item.url).host; } catch { return item.url; } })();
                if (confirm(`Delete:\n${item.title}\n(${host})?`)) {
                  await removeLink(id);
                  load();
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {sorted.map(item => (
            <LinkRow
              key={item.id}
              item={item}
              onToggleFav={async (id, next) => { await updateLink(id, { favorite: next }); load(); }}
              onEdit={(id) => setEditing(id)}
              onDelete={async (id) => {
                const host = (() => { try { return new URL(item.url).host; } catch { return item.url; } })();
                if (confirm(`Delete:\n${item.title}\n(${host})?`)) {
                  await removeLink(id);
                  load();
                }
              }}
            />
          ))}
        </div>
      )}

      {editing && (
        <AddEditModal
          initial={items.find(i=>i.id===editing)!}
          onCancel={()=>setEditing(null)}
          onSave={async (data)=>{ await updateLink(data.id!, {
            title: data.title, url: data.url, tags: data.tags, notes: data.notes, language: data.language
          }); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
