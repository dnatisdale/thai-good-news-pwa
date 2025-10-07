// src/lib/url.ts
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return '';
  // add scheme if missing and force https
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  url = url.replace(/^http:\/\//i, 'https://');
  try {
    const u = new URL(url); // throws if invalid
    return u.toString();
  } catch {
    return url; // return raw; validator will catch
  }
}

export function isValidHttpsUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input));
    return u.protocol === 'https:' && !!u.hostname;
  } catch {
    return false;
  }
}

export function hostFromUrl(input: string): string {
  try {
    return new URL(normalizeUrl(input)).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export function sanitizeText(s: string): string {
  return s.replace(/[<>]/g, '');
}
