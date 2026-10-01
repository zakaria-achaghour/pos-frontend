import { useEffect, useState } from 'react';
import config from '../config';

/**
 * Hook to access environment configuration
 */
export const useConfig = () => {
  return config;
};

/**
 * Hook to check if a feature is enabled
 */
export const useFeature = (featureName: keyof typeof config.features) => {
  return config.features[featureName];
};

/**
 * Hook to get currency formatting
 */
export const useCurrency = () => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency.code,
      minimumFractionDigits: config.currency.decimalPlaces,
      maximumFractionDigits: config.currency.decimalPlaces,
    }).format(amount);
  };

  const formatPrice = (amount: number): string => {
    return `${config.currency.symbol}${amount.toFixed(config.currency.decimalPlaces)}`;
  };

  return {
    symbol: config.currency.symbol,
    code: config.currency.code,
    decimalPlaces: config.currency.decimalPlaces,
    formatCurrency,
    formatPrice
  };
};

/**
 * Hook for theme management
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(config.ui.defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setTheme(config.ui.defaultTheme);
      setIsDarkMode(config.ui.defaultTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setLightTheme = () => {
    setTheme('light');
    setIsDarkMode(false);
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    setIsDarkMode(true);
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  };

  return {
    theme,
    isDarkMode,
    darkModeEnabled: config.ui.enableDarkMode,
    toggleTheme,
    setLightTheme,
    setDarkTheme
  };
};

/**
 * Hook for pagination configuration
 */
export const usePagination = () => {
  const [pageSize, setPageSize] = useState(config.pagination.defaultPageSize);

  const updatePageSize = (newSize: number) => {
    if (newSize <= config.pagination.maxPageSize) {
      setPageSize(newSize);
    }
  };

  return {
    pageSize,
    maxPageSize: config.pagination.maxPageSize,
    defaultPageSize: config.pagination.defaultPageSize,
    updatePageSize
  };
};

/**
 * Hook for file upload validation
 */
export const useFileUpload = () => {
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > config.upload.maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${(config.upload.maxFileSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Check file type for images
    if (file.type.startsWith('image/') && !config.upload.allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${config.upload.allowedImageTypes.join(', ')}`
      };
    }

    return { valid: true };
  };

  return {
    maxFileSize: config.upload.maxFileSize,
    allowedImageTypes: config.upload.allowedImageTypes,
    validateFile
  };
};

/**
 * Hook for debug mode
 */
export const useDebug = () => {
  const log = (...args: unknown[]) => {
    if (config.debug.enabled) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args);
    }
  };

  const warn = (...args: unknown[]) => {
    if (config.debug.enabled) {
      console.warn('[DEBUG]', ...args);
    }
  };

  const error = (...args: unknown[]) => {
    if (config.debug.enabled) {
      console.error('[DEBUG]', ...args);
    }
  };

  return {
    enabled: config.debug.enabled,
    logLevel: config.debug.logLevel,
    log,
    warn,
    error
  };
};