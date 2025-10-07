import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
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
      <NavLink to="/settings" className="btn btn-secondary" onClick={()=>setOpen(false)} aria-label={t('settings')}>{t('settings')}</NavLink>
    </nav>
  );

  const AccountChip = () => (
    <Link
      to="/settings"
      className="btn btn-secondary whitespace-nowrap"
      title={user ? `Signed in as ${user.email}` : 'Sign in'}
      onClick={()=>setOpen(false)}
    >
      {user ? `Signed in: ${name}` : 'Sign in'}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3 justify-between">
          <Link to="/" className="font-bold text-xl" aria-label={t('app_title')}>TGN</Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Nav className="flex items-center gap-2" />
          </div>

          {/* Controls (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <AccountChip />
          </div>

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
        </div>

        {/* Mobile panel */}
        {open && (
          <div id="mobile-nav" className="md:hidden mt-3 grid gap-2">
            <Nav className="grid gap-2" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountChip />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
