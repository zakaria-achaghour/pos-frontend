/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;

  // Authentication Configuration
  readonly VITE_JWT_EXPIRY: string;
  readonly VITE_AUTO_REFRESH_TOKEN: string;

  // Real-time Features
  readonly VITE_PUSHER_APP_KEY: string;
  readonly VITE_PUSHER_CLUSTER: string;
  readonly VITE_ENABLE_REALTIME: string;

  // File Upload Configuration
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_IMAGE_TYPES: string;

  // Debug Configuration
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;

  // UI Configuration
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_SIDEBAR_COLLAPSED: string;

  // Pagination Configuration
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_PAGE_SIZE: string;

  // Currency Configuration
  readonly VITE_CURRENCY_SYMBOL: string;
  readonly VITE_CURRENCY_CODE: string;
  readonly VITE_DECIMAL_PLACES: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_REPORTS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_MULTI_TENANT: string;

  // Development Configuration
  readonly VITE_MOCK_API: string;
  readonly VITE_SKIP_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
