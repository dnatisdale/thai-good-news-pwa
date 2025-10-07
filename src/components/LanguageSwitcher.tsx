import { useI18n } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <select
      className="input w-28"
      value={lang}
      onChange={(e) => setLang(e.target.value as 'en' | 'th')}
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="th">TH</option>
    </select>
  );
}
