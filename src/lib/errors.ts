import type { ApiError } from '@/services/baseApi';

interface AxiosLikeError {
  message?: string;
  response?: { data?: { message?: string; errors?: Record<string, string[]> } };
}

/**
 * Message to show for a failed request. Replaces the `err: any` + `err.response?.data?.message`
 * pattern: accepts an axios error, an RTK Query ApiError, or anything thrown.
 */
export const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as (AxiosLikeError & Partial<ApiError>) | null | undefined;
  return e?.response?.data?.message || e?.message || fallback;
};

/** Laravel validation errors (422) as `{ field: [messages] }`, or undefined. */
export const validationErrors = (err: unknown): Record<string, string[]> | undefined => {
  const e = err as (AxiosLikeError & Partial<ApiError>) | null | undefined;
  return e?.response?.data?.errors ?? e?.errors;
};
