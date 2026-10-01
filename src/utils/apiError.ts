/** Loose shape of an axios / API error as read by the catch blocks. */
export interface ApiErrorLike {
  message?: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
}

/** Narrow an unknown caught value to the error shape the app reads. */
export const asApiError = (e: unknown): ApiErrorLike => (e ?? {}) as ApiErrorLike;
