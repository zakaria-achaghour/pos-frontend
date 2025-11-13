import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuthRedux";
import { useSidebar } from "../hooks/useSidebarRedux";

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  subItems?: { name: string; path: string }[];
  allowedRoles?: Array<'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen'>;
};

const navItems: NavItem[] = [
  {
    icon: "📊",
    name: "Dashboard",
    path: "/dashboard",
    allowedRoles: ['owner', 'manager']
  },
  {
    icon: "👑",
    name: "Owner Dashboard",
    path: "/owner/dashboard",
    allowedRoles: ['owner']
  },
  {
    icon: "👥",
    name: "Staff Management",
    path: "/owner/staff",
    allowedRoles: ['owner']
  },
  {
    icon: "💰",
    name: "Cashier Dashboard",
    path: "/cashier/dashboard",
    allowedRoles: ['cashier']
  },
  {
    icon: "🍽️",
    name: "Tables",
    allowedRoles: ['owner', 'manager', 'cashier', 'waiter'],
    subItems: [
      { name: "View Tables", path: "/tables" },
      { name: "Manage Tables", path: "/tables/manage" },
    ],
  },
  // {
  //   icon: "📊",
  //   name: "Analytics",
  //   path: "/owner/tables",
  //   allowedRoles: ['owner']
  // },
  {
    icon: "📋",
    name: "Menu",
    allowedRoles: ['owner', 'manager'],
    subItems: [
      { name: "Categories", path: "/categories" },
      { name: "Items", path: "/menu/items" },
    ],
  },
  {
    icon: "🛒",
    name: "Orders",
    allowedRoles: ['owner', 'manager', 'cashier', 'waiter'],
    subItems: [
      { name: "Orders List", path: "/orders" },
      { name: "New Order", path: "/orders/new" },
    ],
  },
  // {
  //   icon: "📈",
  //   name: "Reports",
  //   path: "/reports",
  //   allowedRoles: ['owner', 'manager']
  // },
  {
    icon: "🍳",
    name: "Kitchen",
    path: "/kitchen",
    allowedRoles: ['kitchen', 'owner', 'manager']
  },
  {
    icon: "🏢",
    name: "Tenants",
    allowedRoles: ['superadmin'],
    subItems: [
      { name: "Tenants List", path: "/admin/tenants" },
    ],
  },
  {
    icon: "👥",
    name: "Roles & Permissions",
    allowedRoles: ['superadmin'],
    subItems: [
      { name: "Roles", path: "/admin/roles" },
      { name: "Permissions", path: "/admin/permissions" },
    ],
  }
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const toggleSubmenu = (index: number) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.allowedRoles && user?.role && !item.allowedRoles.includes(user.role)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 lg:hidden transition-opacity duration-200 ${
          isMobileOpen ? "opacity-100 z-30" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 ${
          isExpanded || isHovered ? "w-64" : "w-16"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-3">
          <div className="flex items-center space-x-3 w-full">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">POS</span>
            </div>
            {(isExpanded || isHovered) && (
              <span className="text-lg font-bold text-gray-900 dark:text-white transition-all duration-200 truncate">
                Restaurant POS
              </span>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (isExpanded || isHovered) && (
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {filteredNavItems.map((item, index) => (
            <div key={item.name}>
              {item.path ? (
                <Link
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isActive(item.path)
                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title={!(isExpanded || isHovered) ? item.name : undefined}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {(isExpanded || isHovered) && (
                    <span className="ml-3 transition-all duration-200">{item.name}</span>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      openSubmenu === index
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={!(isExpanded || isHovered) ? item.name : undefined}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {(isExpanded || isHovered) && (
                      <>
                        <span className="flex-1 text-left ml-3">{item.name}</span>
                        <span className={`ml-2 text-sm transition-transform duration-200 ${
                          openSubmenu === index ? "rotate-180" : ""
                        }`}>▼</span>
                      </>
                    )}
                  </button>
                  {item.subItems && openSubmenu === index && (isExpanded || isHovered) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive(subItem.path)
                              ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                          }`}
                        >
                          <span className="mr-3 h-1.5 w-1.5 bg-current rounded-full flex-shrink-0" />
                          <span className="transition-all duration-200">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
    </>
  );
};

export default AppSidebar;
