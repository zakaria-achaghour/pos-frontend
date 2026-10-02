import { dynamicT } from '@/i18n/dynamic';
import { useCallback, useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../hooks/useAuthRedux';
import { useSidebar } from '../hooks/useSidebarRedux';
import {
  BoxCubeIcon,
  CartIcon,
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
  LockIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
} from '../icons';

type Role = 'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface SubItem {
  /** i18n key under `nav.` */
  key: string;
  path: string;
  allowedRoles?: Role[];
}

interface NavItem {
  /** i18n key under `nav.` */
  key: string;
  icon: IconComponent;
  path?: string;
  subItems?: SubItem[];
  allowedRoles?: Role[];
}

// Keep allowedRoles in sync with the ProtectedRoute lists in App.tsx (the backend is the real check)
const navItems: NavItem[] = [
  { key: 'dashboard', icon: GridIcon, path: '/dashboard', allowedRoles: ['owner', 'manager'] },
  { key: 'ownerDashboard', icon: PieChartIcon, path: '/owner/dashboard', allowedRoles: ['owner'] },
  { key: 'staff', icon: GroupIcon, path: '/owner/staff', allowedRoles: ['owner'] },
  { key: 'cashierDashboard', icon: DollarLineIcon, path: '/cashier/dashboard', allowedRoles: ['cashier'] },
  {
    key: 'tables',
    icon: TableIcon,
    allowedRoles: ['owner', 'manager', 'cashier', 'waiter'],
    subItems: [
      { key: 'viewTables', path: '/tables' },
      { key: 'manageTables', path: '/tables/manage', allowedRoles: ['owner', 'manager'] },
    ],
  },
  {
    key: 'menu',
    icon: ListIcon,
    allowedRoles: ['owner', 'manager'],
    subItems: [
      { key: 'categories', path: '/categories' },
      { key: 'items', path: '/menu/items' },
    ],
  },
  {
    key: 'orders',
    icon: CartIcon,
    allowedRoles: ['owner', 'manager', 'cashier', 'waiter'],
    subItems: [
      { key: 'ordersList', path: '/orders' },
      { key: 'newOrder', path: '/orders/new' },
    ],
  },
  { key: 'kitchen', icon: TaskIcon, path: '/kitchen', allowedRoles: ['kitchen', 'owner', 'manager'] },
  {
    key: 'tenants',
    icon: BoxCubeIcon,
    allowedRoles: ['superadmin'],
    subItems: [{ key: 'tenantsList', path: '/admin/tenants' }],
  },
  {
    key: 'rolesPermissions',
    icon: LockIcon,
    allowedRoles: ['superadmin'],
    subItems: [
      { key: 'roles', path: '/admin/roles' },
      { key: 'permissions', path: '/admin/permissions' },
    ],
  },
];

const linkBase =
  'group flex min-h-11 items-center gap-3 rounded-xl text-sm font-medium transition-colors';
const linkActive = 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300';
const linkIdle = 'text-sidebar-fg hover:bg-surface-2 hover:text-fg';

/** Section accent for each top-level item's icon (tokens in styles/pos-tokens.css). */
const SECTION_ACCENT: Record<string, string> = {
  dashboard: 'accent-revenue',
  ownerDashboard: 'accent-revenue',
  cashierDashboard: 'accent-revenue',
  staff: 'accent-staff',
  tables: 'accent-tables',
  menu: 'accent-menu',
  orders: 'accent-orders',
  kitchen: 'accent-kitchen',
  tenants: 'accent-admin',
  rolesPermissions: 'accent-admin',
};

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const open = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    setIsMobileOpen(false);
    // Close the mobile drawer when navigation completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileOpen, setIsMobileOpen]);

  const restaurantName = user?.restaurant?.name || user?.restaurant_name || user?.restaurant?.slug || t('ux.brand');
  const restaurantLogo =
    user?.restaurant?.logo_url || user?.restaurant?.logo || user?.restaurant_logo_url || user?.restaurant_logo || null;
  const initials = restaurantName
    ? restaurantName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')
    : '';

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const allowed = (roles: Role[] | undefined) => !roles || (user?.role ? roles.includes(user.role) : false);

  const visibleItems = navItems
    .filter((item) => allowed(item.allowedRoles))
    .map((item) => ({ ...item, subItems: item.subItems?.filter((s) => allowed(s.allowedRoles)) }));

  // The group containing the current page is open by default; the user can toggle any group
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isGroupOpen = (item: NavItem) =>
    toggled[item.key] ?? Boolean(item.subItems?.some((s) => location.pathname.startsWith(s.path) && s.path !== '/'));

  return (
    // Fixed-width slot in the page flow: expanding on hover overlays the content instead of shifting it.
    // Pinning the sidebar open (header toggle) widens the slot so the content moves over.
    <div
      className={twMerge(
        'md:relative md:shrink-0 md:transition-[width] md:duration-300',
        isExpanded ? 'md:w-60' : 'md:w-16'
      )}
    >
      <aside
        aria-label={t('nav.label')}
        className={twMerge(
          'workspace-sidebar fixed inset-y-0 start-0 z-[60] border-e border-line bg-sidebar text-sidebar-fg transition-all duration-300 ease-in-out',
          open ? 'w-60' : 'w-16',
          isMobileOpen
            ? 'visible translate-x-0'
            : 'invisible ltr:-translate-x-full rtl:translate-x-full md:visible md:ltr:translate-x-0 md:rtl:translate-x-0'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full flex-col">
          {isMobileOpen && <button type="button" onClick={() => setIsMobileOpen(false)} aria-label={t('nav.toggleSidebar')} className="absolute end-2 top-1 rounded-lg px-2 text-xl md:hidden">×</button>}
          {/* Branding */}
          <div className="flex h-20 items-center border-b border-line px-3">
            {(restaurantLogo || restaurantName) && (
              <div className="flex w-full items-center gap-3">
                {restaurantLogo ? (
                  <img
                    src={restaurantLogo}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg border border-line object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700"
                  >
                    {initials || restaurantName?.charAt(0).toUpperCase()}
                  </div>
                )}
                {open && restaurantName && (
                  <span className="truncate text-sm font-semibold text-fg">{restaurantName}</span>
                )}
              </div>
            )}
          </div>

          {user && open && (
            <div className="border-b border-line p-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-fg"
                >
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{user.name}</p>
                  <p className="text-xs text-fg-muted">{dynamicT(`roles.${user.role}`, { defaultValue: user.role })}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {visibleItems.map((item) => {
              const label = dynamicT(`nav.${item.key}`);
              const Icon = item.icon;
              const itemClass = twMerge(linkBase, open ? 'px-3' : 'justify-center px-0');

              if (item.path) {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={twMerge(itemClass, active ? linkActive : linkIdle)}
                  >
                    <Icon aria-hidden="true" className={twMerge('h-5 w-5 shrink-0 accent-text', SECTION_ACCENT[item.key])} />
                    {open && <span>{label}</span>}
                  </Link>
                );
              }

              const groupOpen = isGroupOpen(item);
              const hasActiveChild = item.subItems?.some((s) => isActive(s.path)) ?? false;
              return (
                <div key={item.key}>
                  <button
                    type="button"
                    aria-label={label}
                    aria-expanded={open ? groupOpen : undefined}
                    onClick={() => setToggled((prev) => ({ ...prev, [item.key]: !groupOpen }))}
                    className={twMerge(itemClass, 'w-full', hasActiveChild ? linkActive : linkIdle)}
                  >
                    <Icon aria-hidden="true" className={twMerge('h-5 w-5 shrink-0 accent-text', SECTION_ACCENT[item.key])} />
                    {open && (
                      <>
                        <span className="flex-1 text-start">{label}</span>
                        <ChevronDownIcon
                          aria-hidden="true"
                          className={twMerge('h-4 w-4 shrink-0 transition-transform', groupOpen && 'rotate-180')}
                        />
                      </>
                    )}
                  </button>
                  {open && groupOpen && item.subItems && (
                    <ul className="ms-5 mt-1 space-y-1 border-s border-line ps-3">
                      {item.subItems.map((sub) => {
                        const active = isActive(sub.path);
                        return (
                          <li key={sub.key}>
                            <Link
                              to={sub.path}
                              aria-current={active ? 'page' : undefined}
                              className={twMerge(linkBase, 'px-3', active ? linkActive : linkIdle)}
                            >
                              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                              {dynamicT(`nav.${sub.key}`)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default AppSidebar;
