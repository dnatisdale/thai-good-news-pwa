import { useAuth } from '@/hooks/useAuth';
import { syncNow } from '@/lib/cloud';
import { normalizeUrl } from '@/lib/url';
import { toast } from '@/lib/toast';
import { useRef, useState } from 'react';
import { clearAll, importMany } from '@/lib/db';
import { t } from '@/lib/i18n';
import type { SavedLink } from '@/types';

function parseCSV(text: string): Omit<SavedLink, 'id' | 'createdAt' | 'updatedAt'>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows: Omit<SavedLink, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [title, url, tags, notes, language, favorite] = lines[i].split(',');
    rows.push({ title, url, tags: (tags||'').split('|').filter(Boolean), notes, language: (language as any) || 'en', favorite: favorite === 'true', source: 'import' })
  }
  return rows;
}

const { user, signInWithEmailLink, signOut } = useAuth();
const [email, setEmail] = useState('');
const [syncMsg, setSyncMsg] = useState<string | null>(null);

async function onSendLink() {
  if (!email.trim()) { toast('Enter your email', 'error'); return; }
  try {
    await signInWithEmailLink(email.trim());
    toast('Sign-in link sent! Check your email.', 'success');
  } catch (e: any) {
    toast(`Failed to send link: ${e?.message ?? e}`, 'error');
  }
}

async function onSyncNow() {
  try {
    if (!user) { toast('Sign in first', 'error'); return; }
    const res = await syncNow(user.uid);
    setSyncMsg(`Synced — uploaded ${res.up}, downloaded ${res.down}`);
    toast(`Synced: ↑${res.up} ↓${res.down}`, 'success');
  } catch (e: any) {
    // Helpful hint if rules still deny access
    if (e?.code === 'permission-denied') {
      toast('Cloud blocked by Firestore rules. Allow /users/{uid}/links/* for your uid.', 'error');
    } else {
      toast(`Sync failed: ${e?.message ?? e}`, 'error');
    }
  }
}

<section className="card">
  <h2 className="text-lg font-semibold mb-3">Account</h2>

  {!user ? (
    <div className="space-y-2">
      <p className="text-sm opacity-80">Sign in to back up and sync your links across devices.</p>
      <input
        type="email"
        className="input"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button className="btn btn-primary" onClick={onSendLink}>Email me a sign-in link</button>
      <p className="text-xs opacity-70">After you click the link, you’ll return to Settings signed in.</p>
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


export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string | null>(null);

  async function onImport(file: File) {
    const text = await file.text();
    let rows: Omit<SavedLink, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    if (file.name.endsWith('.json')) rows = JSON.parse(text);
    else rows = parseCSV(text);
const withIds = rows.map(r => ({
  ...r,
  url: normalizeUrl(r.url),           // 👈 use the same normalizer
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  updatedAt: Date.now()
})) as SavedLink[];
    const { added, skipped } = await importMany(withIds);
    setResult(`${t('import_result')}: ${added} added, ${skipped} skipped`);
  }

 async function onExportJSON() {
  const data = await (await import('@/lib/db')).getAll();
  const normalized = data.map(d => ({ ...d, url: normalizeUrl(d.url) }));
  const blob = new Blob(
    ["\ufeff" + JSON.stringify(normalized, null, 2)],
    { type: 'application/json;charset=utf-8' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'links.json';
  a.click();
}

 async function onExportCSV() {
  const data = await (await import('@/lib/db')).getAll();
  const normalized = data.map(d => ({ ...d, url: normalizeUrl(d.url) }));
  const header = 'title,url,tags,notes,language,favorite\n';
  const rows = normalized.map(d =>
    [
      d.title,
      d.url,                            // <- normalized
      d.tags.join('|'),
      d.notes ?? '',
      d.language,
      String(d.favorite)
    ].join(',')
  );
  const blob = new Blob(
    ["\ufeff" + header + rows.join('\n')],
    { type: 'text/csv;charset=utf-8' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'links.csv';
  a.click();
}

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <section id="import" className="card">
        <h2 className="text-lg font-semibold mb-3">{t('import')} / {t('export')}</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={onExportJSON}>{t('json')}</button>
          <button className="btn btn-secondary" onClick={onExportCSV}>{t('csv')}</button>
          <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if (f) onImport(f);} } />
          <button className="btn btn-primary" onClick={()=>fileRef.current?.click()}>{t('import')}</button>
        </div>
        {result && <p className="mt-2" role="status">{result}</p>}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">{t('manage_storage')}</h2>
        <button className="btn btn-secondary" onClick={async()=>{ await clearAll(); caches.keys().then(keys=>keys.forEach(k=>caches.delete(k))); alert(t('cleared')); }}>{t('clear_cache')}</button>
      </section>
    </div>
  );
}
