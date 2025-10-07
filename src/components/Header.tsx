import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { user } = useAuth();
  const name = user?.email ? user.email.split('@')[0] : null;

  const Nav = ({ className = '' }: { className?: string }) => (
    <nav className={className}>
      <NavLink to="/" className="btn btn-secondary" onClick={()=>setOpen(false)} aria-label={t('home')}>{t('home')}</NavLink>
      <NavLink to="/add" className="btn btn-primary" onClick={()=>setOpen(false)} aria-label={t('add_link')}>+ {t('add_link')}</NavLink>
      <NavLink to="/favorites" className="btn btn-secondary" onClick={()=>setOpen(false)} aria-label={t('favorites')}>{t('favorites')}</NavLink>
    </nav>
  );

  const AccountChip = () => (
    <Link
      to="/settings"
      className="btn btn-secondary whitespace-nowrap hidden sm:inline-flex"
      title={user ? `Signed in as ${user.email}` : 'Sign in'}
      onClick={()=>setOpen(false)}
    >
      {user ? `Signed in: ${name}` : 'Sign in'}
    </Link>
  );

{/* Left: logo (mobile) or banner (desktop) */}
<Link to="/" className="flex items-center gap-2 min-w-0" aria-label={t('app_title')}>
  {/* Mobile: small square icon */}
  <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0 sm:hidden" />

  {/* Desktop/Tablet: banner wordmark */}
  <img src="/banner.svg" alt="Thai Good News" className="hidden sm:block h-9 w-auto" />

  {/* If you still want 'TGN' text on mobile next to the icon, keep this: */}
  <span className="font-bold text-xl truncate sm:hidden">TGN</span>
</Link>

  const SettingsGear = () => (
    <Link
      to="/settings"
      title={t('settings')} aria-label={t('settings')}
      className="inline-flex items-center justify-center rounded-2xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 min-h-[44px] min-w-[44px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      onClick={()=>setOpen(false)}
    >
      {/* SVG gear icon (currentColor) */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M19.4 13.1a7.6 7.6 0 0 0 0-2.2l2-1.5-1.7-2.9-2.5 0.7a7.7 7.7 0 0 0-1.9-1.1l-0.3-2.6h-3.3l-0.3 2.6a7.7 7.7 0 0 0-1.9 1.1L4.3 6.5 2.6 9.4l2 1.5a7.6 7.6 0 0 0 0 2.2l-2 1.5 1.7 2.9 2.5-0.7c0.6 0.5 1.2 0.8 1.9 1.1l0.3 2.6h3.3l0.3-2.6c0.7-0.3 1.3-0.6 1.9-1.1l2.5 0.7 1.7-2.9-2-1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3 justify-between">
          {/* Left: logo + wordmark */}
          <Link to="/" className="flex items-center gap-2 min-w-0" aria-label={t('app_title')}>
            <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0" />
            <span className="font-bold text-xl truncate">TGN</span>
          </Link>

          {/* Middle: desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Nav className="flex items-center gap-2" />
          </div>

          {/* Right: account (sm+) + menu button + gear */}
          <div className="flex items-center gap-1 sm:gap-2">
            <AccountChip />

            {/* Mobile menu button */}
            <button
              className="btn btn-secondary md:hidden min-h-[44px] min-w-[44px]"
              aria-label="Toggle menu"
              aria-controls="mobile-nav"
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
            >
              ☰
            </button>

            {/* Gear (always last so it's far-right) */}
            <SettingsGear />
          </div>
        </div>

        {/* Mobile slide-down */}
        {open && (
          <div id="mobile-nav" className="md:hidden mt-3 grid gap-2">
            <Nav className="grid gap-2" />
            <div className="flex items-center gap-2">
              <AccountChip />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
