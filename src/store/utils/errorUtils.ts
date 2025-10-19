import type { ApiError, ValidationError } from '../types/common';

// Define minimal AxiosError interface to avoid dependency issues
interface AxiosErrorLike {
  response?: {
    status: number;
    data: any;
  };
  message: string;
  code?: string;
}

/**
 * Parse API error from axios error
 */
export const parseApiError = (error: AxiosErrorLike): ApiError => {
  const response = error.response;
  
  if (!response) {
    return {
      message: error.message || 'Network error occurred',
      ...(error.code && { code: error.code }),
      status: 0,
    };
  }

  const data = response.data as any;
  const apiError: ApiError = {
    message: data?.message || `Request failed with status ${response.status}`,
    status: response.status,
    ...(data?.code && { code: data.code }),
  };

  // Handle validation errors (Laravel format)
  if (response.status === 422 && data?.errors) {
    const validationErrors: ValidationError[] = [];
    
    Object.entries(data.errors as Record<string, string[]>).forEach(([field, messages]) => {
      messages.forEach((message) => {
        validationErrors.push({ field, message });
      });
    });
    
    apiError.validationErrors = validationErrors;
    apiError.message = validationErrors.length > 0 && validationErrors[0] 
      ? validationErrors[0].message 
      : 'Validation failed';
  }

  return apiError;
};

/**
 * Convert validation errors to field-indexed format
 */
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  
  errors.forEach(({ field, message }) => {
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(message);
  });
  
  return formatted;
};

/**
 * Get first validation error message for a field
 */
export const getFieldError = (
  validationErrors: Record<string, string[]>, 
  field: string
): string | null => {
  const fieldErrors = validationErrors[field];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] || null : null;
};

/**
 * Check if field has validation errors
 */
export const hasFieldError = (
  validationErrors: Record<string, string[]>, 
  field: string
): boolean => {
  return !!(validationErrors[field] && validationErrors[field].length > 0);
};

/**
 * Clear specific field error
 */
export const clearFieldError = (
  validationErrors: Record<string, string[]>, 
  field: string
): Record<string, string[]> => {
  const { [field]: removed, ...rest } = validationErrors;
  return rest;
};

/**
 * Merge validation errors
 */
export const mergeValidationErrors = (
  existing: Record<string, string[]>,
  newErrors: Record<string, string[]>
): Record<string, string[]> => {
  const merged = { ...existing };
  
  Object.entries(newErrors).forEach(([field, messages]) => {
    merged[field] = [...(merged[field] || []), ...messages];
  });
  
  return merged;
};

/**
 * Get readable error message from API error
 */
export const getErrorMessage = (error: ApiError): string => {
  if (error.validationErrors && error.validationErrors.length > 0 && error.validationErrors[0]) {
    return error.validationErrors[0].message;
  }
  
  return error.message;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: ApiError): boolean => {
  return error.status === 422 && !!(error.validationErrors?.length);
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: ApiError): boolean => {
  return error.status === 401;
};

/**
 * Check if error is authorization error
 */
export const isAuthorizationError = (error: ApiError): boolean => {
  return error.status === 403;
};

/**
 * Check if error is not found error
 */
export const isNotFoundError = (error: ApiError): boolean => {
  return error.status === 404;
};

/**
 * Check if error is server error
 */
export const isServerError = (error: ApiError): boolean => {
  return !!(error.status && error.status >= 500);
};