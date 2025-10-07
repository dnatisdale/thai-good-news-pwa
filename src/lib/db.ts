// src/lib/db.ts
import { openDB, IDBPDatabase } from 'idb';
import type { SavedLink } from '@/types';

const DB_NAME = 'tgn-db';
const DB_VERSION = 1;
const STORE = 'links';

let _db: IDBPDatabase | null = null;

async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('by_url', 'url', { unique: true });
      store.createIndex('by_fav', 'favorite');
      store.createIndex('by_title', 'title');
      store.createIndex('by_lang', 'language');
    }
  });
  return _db;
}

export async function addLink(link: SavedLink) {
  const db = await getDB();
  await db.put(STORE, link);
}

export async function getAll(): Promise<SavedLink[]> {
  const db = await getDB();
  return (await db.getAll(STORE)) as SavedLink[];
}

export async function getByUrl(url: string) {
  const db = await getDB();
  return (await db.getFromIndex(STORE, 'by_url', url)) as SavedLink | undefined;
}

export async function updateLink(id: string, patch: Partial<SavedLink>) {
  const db = await getDB();
  const current = (await db.get(STORE, id)) as SavedLink | undefined;
  if (!current) return;
  await db.put(STORE, { ...current, ...patch, updatedAt: Date.now() });
}

export async function removeLink(id: string) {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clearAll() {
  const db = await getDB();
  await db.clear(STORE);
}

/**
 * Bulk import with de-dupe by URL.
 * - Forces https:// (http:// -> https://) for safety.
 * - Skips duplicates by 'by_url' index.
 */
export async function importMany(
  rows: SavedLink[]
): Promise<{ added: number; skipped: number }> {
  const db = await getDB();
  let added = 0, skipped = 0;

  for (const r of rows) {
    const httpsUrl = r.url.replace(/^http:\/\//i, 'https://');
    try {
      const exists = (await db.getFromIndex(STORE, 'by_url', httpsUrl)) as SavedLink | undefined;
      if (exists) { skipped++; continue; }
      await db.add(STORE, { ...r, url: httpsUrl });
      added++;
    } catch (err) {
      console.error('importMany error', err);
      skipped++;
    }
  }

  return { added, skipped };
}
