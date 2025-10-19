// Environment configuration with defaults and validation
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Restaurant POS',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  },

  // Authentication Configuration
  auth: {
    jwtExpiry: parseInt(import.meta.env.VITE_JWT_EXPIRY || '3600'),
    autoRefresh: import.meta.env.VITE_AUTO_REFRESH_TOKEN === 'true',
  },

  // Real-time Configuration
  realtime: {
    pusherAppKey: import.meta.env.VITE_PUSHER_APP_KEY || '',
    pusherCluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1',
    enabled: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },

  // Debug Configuration
  debug: {
    enabled: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // UI Configuration
  ui: {
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
    darkModeEnabled: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
    sidebarCollapsed: import.meta.env.VITE_SIDEBAR_COLLAPSED === 'true',
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  },

  // Currency Configuration
  currency: {
    symbol: import.meta.env.VITE_CURRENCY_SYMBOL || '$',
    code: import.meta.env.VITE_CURRENCY_CODE || 'USD',
    decimalPlaces: parseInt(import.meta.env.VITE_DECIMAL_PLACES || '2'),
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    reports: import.meta.env.VITE_ENABLE_REPORTS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    multiTenant: import.meta.env.VITE_ENABLE_MULTI_TENANT === 'true',
  },

  // Development Configuration
  dev: {
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
    skipAuth: import.meta.env.VITE_SKIP_AUTH === 'true',
  },

  // Helper methods
  isDevelopment: () => config.app.environment === 'development',
  isProduction: () => config.app.environment === 'production',
  
  // Validation method
  validate: () => {
    const errors: string[] = [];
    
    if (!config.api.baseUrl) {
      errors.push('VITE_API_URL is required');
    }
    
    if (!config.app.name) {
      errors.push('VITE_APP_NAME is required');
    }
    
    if (config.realtime.enabled && !config.realtime.pusherAppKey) {
      errors.push('VITE_PUSHER_APP_KEY is required when realtime is enabled');
    }
    
    if (errors.length > 0) {
      console.error('Configuration validation errors:', errors);
      return false;
    }
    
    return true;
  }
};

// Validate configuration on import
config.validate();

// Export specific configurations for easier imports
export const apiConfig = config.api;
export const appConfig = config.app;
export const authConfig = config.auth;
export const debugConfig = config.debug;
export const featureFlags = config.features;

export default config;