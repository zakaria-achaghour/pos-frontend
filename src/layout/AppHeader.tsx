import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../hooks/useSidebarRedux';
import { useAuth } from '../hooks/useAuthRedux';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import UserDropdown from '../components/header/UserDropdown';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const hasSidebar = user?.role !== 'waiter' && user?.role !== 'kitchen';
  const restaurantName = user?.restaurant?.name || user?.restaurant_name || t('ux.brand');
  const restaurantLogo = user?.restaurant?.logo_url || user?.restaurant?.logo || user?.restaurant_logo_url || user?.restaurant_logo;
  const homeLink = user?.role === 'waiter' ? '/tables' : '/';
  const menuIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>;

  return (
    <header className="workspace-header sticky top-0 z-50 border-b border-line bg-surface text-fg backdrop-blur-xl">
      <div className="flex h-18 items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {hasSidebar && <>
            <button type="button" onClick={toggleSidebar} aria-label={t('nav.toggleSidebar')} aria-expanded={isExpanded} className="header-control hidden md:flex">{menuIcon}</button>
            <button type="button" onClick={toggleMobileSidebar} aria-label={t('nav.toggleSidebar')} aria-expanded={isMobileOpen} className="header-control md:hidden">{menuIcon}</button>
          </>}
          <Link to={homeLink} className="flex min-w-0 items-center gap-3">
            {restaurantLogo && <img src={restaurantLogo} alt="" className="h-10 w-10 rounded-xl object-cover"/>}
            <div className="min-w-0">
              <p className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-fg-muted sm:block">{t('ux.workspace')}</p>
              <p className="max-w-[180px] truncate text-sm font-semibold sm:max-w-xs">{restaurantName}</p>
            </div>
          </Link>
        </div>
        <div className="hidden items-center gap-3 md:flex"><LanguageSwitcher/><ThemeToggleButton/><span className="mx-1 h-8 w-px bg-line"/><UserDropdown/></div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('nav.toggleMenu')} aria-expanded={menuOpen} className="header-control md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
      {menuOpen && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface p-4 md:hidden"><LanguageSwitcher/><ThemeToggleButton/><UserDropdown/></div>}
    </header>
  );
}
