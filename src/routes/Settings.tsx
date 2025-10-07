import { useState } from 'react';
import type React from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useFontSize } from '@/hooks/useFontSize';
import { APP_VERSION } from '@/version';

import { getAll, importMany, clearAll } from '@/lib/db';
import { normalizeUrl } from '@/lib/url';
import { syncNow } from '@/lib/cloud';
import { toast } from '@/lib/toast';
import type { SavedLink } from '@/types';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const { user, signInWithEmailLink, signOut } = useAuth();
  const { scale, setScale } = useFontSize(); // 80–160% slider
  const [email, setEmail] = useState('');
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // --- Account (email link) ---
  const onSendLink = async () => {
    if (!email.trim()) { toast('Enter your email', 'error'); return; }
    try { await signInWithEmailLink(email.trim()); toast('Sign-in link sent! Check your email.', 'success'); }
    catch (e: any) { toast(`Failed to send link: ${e?.message ?? e}`, 'error'); }
  };

  const onSyncNow = async () => {
    try {
      if (!user) { toast('Sign in first', 'error'); return; }
      const res = await syncNow(user.uid);
      setSyncMsg(`Synced — uploaded ${res.up}, downloaded ${res.down}`);
      toast(`Synced: ↑${res.up} ↓${res.down}`, 'success');
    } catch (e: any) {
      if (e?.code === 'permission-denied') toast('Cloud blocked by Firestore rules. Allow /users/{uid}/links/*.', 'error');
      else toast(`Sync failed: ${e?.message ?? e}`, 'error');
    }
  };

  // --- Export (normalize https) ---
  const onExportJSON = async () => {
    const data = await getAll();
    const normalized = data.map(d => ({ ...d, url: normalizeUrl(d.url) }));
    const blob = new Blob(['\ufeff' + JSON.stringify(normalized, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'links.json'; a.click();
  };

  const onExportCSV = async () => {
    const data = await getAll();
    const normalized = data.map(d => ({ ...d, url: normalizeUrl(d.url) }));
    const header = 'title,url,tags,notes,language,favorite\n';
    const rows = normalized.map(d => [d.title, d.url, d.tags.join('|'), d.notes ?? '', d.language, String(d.favorite)].join(','));
    const blob = new Blob(['\ufeff' + header + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'links.csv'; a.click();
  };

  // --- Import (JSON/CSV → normalized) ---
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      let rows: any[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        rows = JSON.parse(text);
      } else {
        const lines = text.split(/\r?\n/).filter(Boolean);
        const header = lines.shift()!;
        const cols = header.split(',').map(s => s.trim());
        rows = lines.map(line => {
          const cells = line.split(',');
          const obj: any = {};
          cols.forEach((c, i) => { obj[c] = cells[i] ?? ''; });
          if (typeof obj.tags === 'string') obj.tags = obj.tags.split('|').filter(Boolean);
          obj.favorite = String(obj.favorite).toLowerCase() === 'true';
          return obj;
        });
      }
      const withIds: SavedLink[] = rows.map(r => {
        const finalUrl = normalizeUrl(r.url);
        let title = r.title;
        if (!title) {
          try { title = new URL(finalUrl).hostname.replace(/^www\./i, ''); } catch { title = finalUrl; }
        }
        return {
          id: crypto.randomUUID(),
          title,
          url: finalUrl,
          tags: Array.isArray(r.tags) ? r.tags : [],
          notes: r.notes || undefined,
          language: r.language || 'en',
          favorite: !!r.favorite,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: 'import'
        };
      });
      const res = await importMany(withIds);
      toast(`Imported: added ${res.added}, skipped ${res.skipped}`, 'success');
      (e.target as HTMLInputElement).value = '';
    } catch (err: any) {
      console.error(err);
      toast(`Import failed: ${err?.message ?? err}`, 'error');
    }
  };

  const onClearAll = async () => {
    if (!confirm('Delete ALL saved links on this device?')) return;
    await clearAll(); toast('All local data cleared.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-6">

      {/* Language */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">{t('language')}</h2>
        <select
          className="input w-40"
          value={lang}
          onChange={(e) => setLang(e.target.value as 'en' | 'th')}
          aria-label={t('language')}
        >
          <option value="en">English</option>
          <option value="th">ไทย (Thai)</option>
        </select>
        <p className="text-sm opacity-70 mt-2">{t('preview')}: {t('home')} • {t('settings')} • {t('favorites')}</p>
      </section>

      {/* Font Size slider */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">{t('font_size')}</h2>
        <div className="flex items-center gap-3">
          <span className="w-10 text-right">{scale}%</span>
          <input
            type="range"
            min={80}
            max={160}
            step={5}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1"
            aria-label={t('font_size')}
          />
        </div>
      </section>

      {/* Account */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">Account</h2>
        {!user ? (
          <div className="space-y-2">
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={onSendLink}>Email sign-in link</button>
            </div>
            <p className="text-xs opacity-70">Click the link in your email to finish sign-in.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">Signed in as <strong>{user.email}</strong></p>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={onSyncNow}>Sync now</button>
              <button className="btn btn-secondary" onClick={() => signOut()}>Sign out</button>
            </div>
            {syncMsg && <p className="text-sm opacity-80">{syncMsg}</p>}
          </div>
        )}
      </section>

      {/* Import / Export */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">Import / Export</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary" onClick={onExportJSON}>Export JSON</button>
          <button className="btn btn-secondary" onClick={onExportCSV}>Export CSV</button>
          <label className="btn btn-primary cursor-pointer">
            Import (JSON or CSV)
            <input type="file" accept=".json,.csv" className="hidden" onChange={onImport} />
          </label>
          <button className="btn btn-secondary" onClick={onClearAll}>Clear all (local)</button>
        </div>
      </section>

      {/* About */}
      <section className="card" id="about">
        <h2 className="text-lg font-semibold mb-3">{t('about_app')}</h2>
        <p className="text-sm opacity-80">
          {t('version')}: <strong>v{APP_VERSION}</strong>
        </p>
      </section>
    </div>
  );
}
