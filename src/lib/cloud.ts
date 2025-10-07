import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import type { SavedLink } from '@/types';
import { normalizeUrl } from '@/lib/url';
import { getAll, importMany } from '@/lib/db';

// URL → stable doc id (base64url)
function docIdFromUrl(u: string) {
  const s = normalizeUrl(u);
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function linksCol(uid: string) {
  return collection(db, 'users', uid, 'links');
}

export async function cloudUpsertLink(uid: string, link: SavedLink) {
  const url = normalizeUrl(link.url);
  const ref = doc(linksCol(uid), docIdFromUrl(url));
  const payload = { ...link, url, owner: uid };
  await setDoc(ref, payload, { merge: true });
}

export async function cloudDeleteLink(uid: string, url: string) {
  const ref = doc(linksCol(uid), docIdFromUrl(url));
  await deleteDoc(ref);
}

export async function cloudListLinks(uid: string): Promise<SavedLink[]> {
  const snap = await getDocs(linksCol(uid));
  const out: SavedLink[] = [];
  snap.forEach(d => {
    const v = d.data() as any;
    out.push({
      id: v.id || crypto.randomUUID(),
      title: v.title,
      url: normalizeUrl(v.url),
      tags: Array.isArray(v.tags) ? v.tags : [],
      notes: v.notes || undefined,
      language: v.language || 'en',
      createdAt: v.createdAt || Date.now(),
      updatedAt: v.updatedAt || Date.now(),
      favorite: !!v.favorite,
      source: v.source || 'import'
    });
  });
  return out;
}

export async function syncNow(uid: string): Promise<{ up: number; down: number }> {
  const locals = await getAll();
  const localByUrl = new Map(locals.map(l => [normalizeUrl(l.url), l]));
  const localUrls = new Set(localByUrl.keys());

  const cloud = await cloudListLinks(uid);
  const cloudByUrl = new Map(cloud.map(c => [normalizeUrl(c.url), c]));
  const cloudUrls = new Set(cloudByUrl.keys());

  // Upload locals missing from cloud
  let up = 0, down = 0;
  for (const url of localUrls) {
    if (!cloudUrls.has(url)) {
      await cloudUpsertLink(uid, localByUrl.get(url)!);
      up++;
    }
  }

  // Download cloud missing from local
  const toImport: SavedLink[] = [];
  for (const url of cloudUrls) {
    if (!localUrls.has(url)) {
      toImport.push(cloudByUrl.get(url)!);
      down++;
    }
  }
  if (toImport.length) await importMany(toImport);

  return { up, down };
}
