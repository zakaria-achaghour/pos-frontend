import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "../hooks/useSidebarRedux";
import { useTheme } from "../hooks/useThemeRedux";
import { useAuth } from "../hooks/useAuthRedux";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  // Apply theme class to document root for table components
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Determine if current page is table-related for enhanced styling
  const isTablePage = location.pathname.includes('/table');

  // Check if user is kitchen staff or waiter for full-screen layout
  const isFullScreenRole = user?.role === 'kitchen' || user?.role === 'waiter';

  // Full-screen layout for kitchen staff and waiters (header only, no sidebar)
  if (isFullScreenRole) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
        ? 'bg-gray-900 text-white'
        : 'bg-gray-50 text-gray-900'
        }`}>
        <AppHeader />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    );
  }

  // Normal layout for other roles
  return (

    <div className={`min-h-screen md:flex transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gray-900 text-white'
      : 'bg-gray-50 text-gray-900'
      } ${isTablePage ? 'table-management-layout' : ''}`}>
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "md:ml-25" : "md:ml-16"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className={`p-4 mx-auto max-w-7xl md:p-6 ${isTablePage ? 'table-management-content' : ''
          }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;
