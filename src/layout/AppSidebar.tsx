import { useCallback, useState, type ComponentType, type SVGProps } from 'react';
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
  'group flex min-h-11 items-center gap-3 rounded-lg text-sm font-medium transition-colors';
const linkActive = 'bg-white/15 text-white';
const linkIdle = 'text-sidebar-fg/80 hover:bg-white/10 hover:text-sidebar-fg';

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const open = isExpanded || isHovered || isMobileOpen;

  const restaurantName = user?.restaurant?.name || user?.restaurant_name || user?.restaurant?.slug || null;
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
        isExpanded ? 'md:w-64' : 'md:w-16'
      )}
    >
      <aside
        aria-label={t('nav.label')}
        className={twMerge(
          'fixed inset-y-0 start-0 z-40 border-e border-white/10 bg-sidebar text-sidebar-fg shadow-lg transition-all duration-300 ease-in-out md:absolute',
          open ? 'w-64' : 'w-16',
          isMobileOpen
            ? 'translate-x-0'
            : 'ltr:-translate-x-full rtl:translate-x-full md:ltr:translate-x-0 md:rtl:translate-x-0'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full flex-col">
          {/* Branding */}
          <div className="flex h-16 items-center border-b border-white/10 px-3">
            {(restaurantLogo || restaurantName) && (
              <div className="flex w-full items-center gap-3">
                {restaurantLogo ? (
                  <img
                    src={restaurantLogo}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-fg text-sm font-bold text-sidebar"
                  >
                    {initials || restaurantName?.charAt(0).toUpperCase()}
                  </div>
                )}
                {open && restaurantName && (
                  <span className="truncate font-display text-lg font-bold text-white">{restaurantName}</span>
                )}
              </div>
            )}
          </div>

          {user && open && (
            <div className="border-b border-white/10 p-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-medium text-white"
                >
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-sidebar-fg/70">{t(`roles.${user.role}`, { defaultValue: user.role })}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {visibleItems.map((item) => {
              const label = t(`nav.${item.key}`);
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
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
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
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
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
                    <ul className="ms-8 mt-1 space-y-1">
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
                              {t(`nav.${sub.key}`)}
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
