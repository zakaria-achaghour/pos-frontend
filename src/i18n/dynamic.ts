import type { TOptions } from 'i18next';
import i18n from './index';

/** Runtime guard for values supplied by the API (custom roles, unknown future statuses). */
export function dynamicT(key: string, options: TOptions = {}): string {
  const normalized = key.startsWith('roles.') ? key.toLowerCase() : key;
  if (!i18n.exists(normalized)) return i18n.t('apiErrors.unknown');
  return String(i18n.t(normalized, { ...options, defaultValue: i18n.t('apiErrors.unknown') }));
}
