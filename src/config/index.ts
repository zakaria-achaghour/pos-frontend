// API Configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
  version: 'v1',
};

// Application Configuration
export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Restaurant POS',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
};

// Authentication Configuration
export const authConfig = {
  jwtExpiry: parseInt(import.meta.env.VITE_JWT_EXPIRY || '3600'),
  autoRefreshToken: import.meta.env.VITE_AUTO_REFRESH_TOKEN === 'true',
  tokenKey: 'auth_token',
  userKey: 'user',
};

// File Upload Configuration
export const uploadConfig = {
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedImageTypes: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
};

// UI Configuration
export const uiConfig = {
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  sidebarCollapsed: import.meta.env.VITE_SIDEBAR_COLLAPSED === 'true',
};

// Pagination Configuration
export const paginationConfig = {
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'),
  maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  pageSizeOptions: [10, 20, 50, 100],
};

// Currency Configuration
export const currencyConfig = {
  symbol: import.meta.env.VITE_CURRENCY_SYMBOL || '$',
  code: import.meta.env.VITE_CURRENCY_CODE || 'USD',
  decimalPlaces: parseInt(import.meta.env.VITE_DECIMAL_PLACES || '2'),
};

// Feature Flags
export const features = {
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  reports: import.meta.env.VITE_ENABLE_REPORTS === 'true',
  notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  multiTenant: import.meta.env.VITE_ENABLE_MULTI_TENANT === 'true',
  realtime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
};

// Debug Configuration
export const debugConfig = {
  enabled: import.meta.env.VITE_DEBUG_MODE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Development Configuration (remove in production)
export const devConfig = {
  mockApi: import.meta.env.VITE_MOCK_API === 'true',
  skipAuth: import.meta.env.VITE_SKIP_AUTH === 'true',
};

// Export all configurations
export default {
  api: apiConfig,
  app: appConfig,
  auth: authConfig,
  upload: uploadConfig,
  ui: uiConfig,
  pagination: paginationConfig,
  currency: currencyConfig,
  features,
  debug: debugConfig,
  dev: devConfig,
};
