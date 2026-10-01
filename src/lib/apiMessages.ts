import i18n from '@/i18n';
import type { ApiErrorLike } from '@/utils/apiError';

const knownMessages: Record<string, string> = {
  'Invalid credentials': 'apiErrors.credentials',
  'Your account is currently inactive. Please contact your manager.': 'apiErrors.inactive',
  'This account has been deleted. Please contact your administrator.': 'apiErrors.deleted',
  'Tenant not set': 'apiErrors.tenant',
  'You already have an open shift.': 'apiErrors.shiftOpen',
  'No open shift to close.': 'apiErrors.shiftMissing',
  'Cannot update a completed or cancelled order': 'apiErrors.terminalOrder',
  'Cannot update status of a completed or cancelled order': 'apiErrors.terminalOrder',
  'Order cannot be closed in current status': 'apiErrors.terminalOrder',
  'Ticket cannot be started in current status': 'apiErrors.ticketState',
  'Ticket cannot be completed in current status': 'apiErrors.ticketState',
  'Ticket cannot be served in current status': 'apiErrors.ticketState',
};

/** Do not display untrusted/untranslated server prose. Preserve field keys for form binding. */
export function localizeApiError(error: unknown): string {
  const e = (error ?? {}) as ApiErrorLike & { localized?: boolean };
  if (e.localized && e.message) return e.message;
  const status = e.response?.status ?? e.status;
  const body = e.response?.data;
  const known = knownMessages[body?.message ?? ''];
  const key = known ?? (status === 401 ? 'apiErrors.session' : status === 403 ? 'apiErrors.forbidden'
    : status === 404 ? 'apiErrors.notFound' : status === 422 ? 'apiErrors.validation'
    : status === 429 ? 'apiErrors.rateLimit' : status && status >= 500 ? 'apiErrors.server'
    : e.code === 'ECONNABORTED' ? 'apiErrors.timeout' : !status ? 'apiErrors.network' : 'apiErrors.unexpected');
  // These keys are checked through the explicit apiErrors family by the locale checker.
  const message = i18n.t(key);
  const errors = body?.errors ?? e.errors;
  if (errors) {
    for (const field of Object.keys(errors)) {
      errors[field] = errors[field]!.map(message => {
        if (/required/i.test(message)) return i18n.t('apiErrors.required');
        if (/already been taken/i.test(message)) return i18n.t('apiErrors.unique');
        if (/valid email/i.test(message)) return i18n.t('apiErrors.email');
        if (/numeric|number|integer/i.test(message)) return i18n.t('apiErrors.number');
        return i18n.t('apiErrors.invalidField');
      });
    }
  }
  if (body) body.message = message;
  e.message = message;
  e.localized = true;
  return message;
}

/** Translate response envelopes without changing business data or nested customer content. */
export function localizeApiResponse(data: unknown): void {
  if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') return;
  data.message = 'success' in data && data.success === false
    ? i18n.t('apiErrors.unexpected') : i18n.t('apiErrors.success');
}
