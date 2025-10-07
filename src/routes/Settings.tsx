// src/routes/Settings.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAll, importMany, clearAll } from '@/lib/db';
import { normalizeUrl } from '@/lib/url';
import { syncNow } from '@/lib/cloud';
import { toast } from '@/lib/toast';
import type { SavedLink } from '@/types';

export default function Settings() {
  // ✅ All hooks are INSIDE the component:
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
      if (e?.code === 'permission-denied') {
        toast('Cloud blocked by Firestore rules. Allow /users/{uid}/links/*.', 'error');
      } else {
        toast(`Sync failed: ${e?.message ?? e}`, 'error');
      }
    }
  }

  // ---- Export helpers (normalize https on export) ----
  async function onExportJSON() {
    const data = await getAll();
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
    const data = await getAll();
    const normalized = data.map(d => ({ ...d, url: normalizeUrl(d.url) }));
    const header = 'title,url,tags,notes,language,favorite\n';
    const rows = normalized.map(d =>
      [
        d.title,
        d.url,
        d.tags.join('|'),
        d.notes ?? '',
        d.language,
        String(d.favorite)
      ].join(',')
    );
    const blob = new Blob(["\ufeff" + header + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'links.csv';
    a.click();
  }

  // ---- Import JSON/CSV (normalize to https) ----
  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let rows: any[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        rows = JSON.parse(text);
      } else {
        // Tiny CSV reader (expects header: title,url,tags,notes,language,favorite)
        const [first, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const cols = first.split(',');
        rows = lines.map(line => {
          const cells = line.split(',');
          const obj: any = {};
          cols.forEach((c, i) => obj[c.trim()] = cells[i] ?? '');
          if (typeof obj.tags === 'string') obj.tags = obj.tags.split('|').filter(Boolean);
          obj.favorite = String(obj.favorite).toLowerCase() === 'true';
          return obj;
        });
      }
      const withIds: SavedLink[] = rows.map(r => ({
        id: crypto.randomUUID(),
        title: r.title || (new URL(normalizeUrl(r.url)).hostname.replace(/^www\./i
