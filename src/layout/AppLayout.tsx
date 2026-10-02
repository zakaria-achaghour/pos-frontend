import React, { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useThemeRedux";
import { useAuth } from "../hooks/useAuthRedux";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import RouteFallback from "@/components/common/RouteFallback";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Apply theme class to document root for table components
  useEffect(() => {
    // toggle only the theme class; don't wipe other classes on <html>
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Determine if current page is table-related for enhanced styling
  const isTablePage = location.pathname.includes('/table');

  // Check if user is kitchen staff or waiter for full-screen layout
  const isFullScreenRole = user?.role === 'kitchen' || user?.role === 'waiter';

  // Full-screen layout for kitchen staff and waiters (header only, no sidebar)
  if (isFullScreenRole) {
    return (
      <div className="workspace min-h-screen bg-bg text-fg transition-colors duration-300">
        <AppHeader />
        <div className="p-4">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    );
  }

  // Normal layout for other roles
  return (

    <div className={`workspace min-h-screen md:flex bg-bg text-fg transition-colors duration-300 ${isTablePage ? 'table-management-layout' : ''}`}>
      <AppSidebar />
      <Backdrop />
      {/* The sidebar slot already takes its own width in the flex row: no extra margin here */}
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main id="main-content" className={`workspace-content p-4 mx-auto max-w-[1600px] md:p-8 ${isTablePage ? 'table-management-content' : ''
          }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;
