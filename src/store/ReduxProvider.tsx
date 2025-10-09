import React from "react";
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppDispatch } from '../store/hooks';
import { initializeAuth } from '../store/slices/authSlice';
import { initializeTheme } from '../store/slices/themeSlice';
import { setIsMobile } from '../store/slices/sidebarSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Component to handle app initialization
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth
    dispatch(initializeAuth());
    
    // Initialize theme
    dispatch(initializeTheme());
    
    // Handle responsive sidebar
    const handleResize = () => {
      const mobile = window.innerWidth < 1280; // Mobile behavior up to xl breakpoint (1280px)
      dispatch(setIsMobile(mobile));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  return <>{children}</>;
};

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
};