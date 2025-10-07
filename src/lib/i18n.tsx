// src/lib/i18n.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';

export type Lang = 'en' | 'th';

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    app_title: 'Thai Good News',
    home: 'Home',
    add_link: 'Add Link',
    favorites: 'Favorites',
    settings: 'Settings',
    about: 'About',
    search: 'Search',
    language_filter: 'Language',
    tag_filter: 'Tag Filter',
    favorite_filter: 'Favorites Only',
    no_data: 'No Data Yet.',
    cancel: 'Cancel',
    share: 'Share',
    edit: 'Edit',
    delete: 'Delete',
    favorite: 'Favorite',
    unfavorite: 'Unfavorite',
    copied: 'Copied!',
    // new:
    language: 'Language',
    font_size: 'Font Size',
    about_app: 'About This App',
    version: 'Version',
    preview: 'Preview',
    // Add Link page:
    add_link_form_title: 'Add Link',
    field_title: 'Title',
    field_url: 'URL',
    field_tags: 'Tags',
    field_notes: 'Notes',
    field_language: 'Language',
    btn_save: 'Save',
    btn_cancel: 'Cancel',
  },
  th: {
    app_title: 'ข่าวดีไทย',
    home: 'หน้าแรก',
    add_link: 'เพิ่มลิงก์',
    favorites: 'รายการโปรด',
    settings: 'ตั้งค่า',
    about: 'เกี่ยวกับ',
    search: 'ค้นหา',
    language_filter: 'ภาษา',
    tag_filter: 'ตัวกรองแท็ก',
    favorite_filter: 'เฉพาะรายการโปรด',
    no_data: 'ยังไม่มีข้อมูล',
    cancel: 'ยกเลิก',
    share: 'แชร์',
    edit: 'แก้ไข',
    delete: 'ลบ',
    favorite: 'เพิ่มรายการโปรด',
    unfavorite: 'เอาออกจากรายการโปรด',
    copied: 'คัดลอกแล้ว!',
    // new:
    language: 'ภาษา',
    font_size: 'ขนาดตัวอักษร',
    about_app: 'เกี่ยวกับแอปนี้',
    version: 'เวอร์ชัน',
    preview: 'ตัวอย่าง',
    // Add Link page:
    add_link_form_title: 'เพิ่มลิงก์',
    field_title: 'ชื่อเรื่อง',
    field_url: 'ลิงก์ (URL)',
    field_tags: 'แท็ก',
    field_notes: 'หมายเหตุ',
    field_language: 'ภาษา',
    btn_save: 'บันทึก',
    btn_cancel: 'ยกเลิก',
  }
};

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, unknown>) => string;
};

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(storage.get('lang', 'en'));
  useEffect(() => { storage.set('lang', lang); }, [lang]);

  const dict = useMemo(() => DICT[lang], [lang]);
  const t = useCallback((key: string, vars?: Record<string, unknown>) => {
    let s = dict[key] ?? DICT.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }, [dict]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() { return useContext(Ctx); }

/** Legacy fallback (non-reactive). OK for logs; UI should prefer useI18n(). */
export function t(key: string, vars?: Record<string, unknown>) {
  try {
    const lang = (localStorage.getItem('lang') as Lang) || 'en';
    let s = (DICT[lang]?.[key] ?? DICT.en[key] ?? key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  } catch {
    return DICT.en[key] ?? key;
  }
}
