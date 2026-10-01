/**
 * All money goes through here so every screen shows the same format.
 * Amounts from the Laravel API often arrive as strings ("12.50"), so inputs are coerced.
 */

export const DEFAULT_CURRENCY = 'MAD';

/** Round to cents; avoids float artifacts like 20.979999999999997 */
export const toCents = (value: number): number => Math.round(value * 100) / 100;

export const toNumber = (value: unknown): number => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
};

/** Arabic keeps Latin digits (0-9): that is what cashiers and printed receipts use in Morocco. */
const localeForLanguage = (lang: string): string => {
  if (lang.startsWith('ar')) return 'ar-MA-u-nu-latn';
  if (lang.startsWith('fr')) return 'fr-MA';
  return 'en';
};

const formatterCache = new Map<string, Intl.NumberFormat>();

export interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
}

export const formatMoney = (value: unknown, options: FormatMoneyOptions = {}): string => {
  const currency = options.currency || DEFAULT_CURRENCY;
  const locale = options.locale || localeForLanguage(typeof document !== 'undefined' ? document.documentElement.lang : '');
  const key = `${locale}|${currency}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    } catch {
      formatter = new Intl.NumberFormat('fr-MA', { style: 'currency', currency });
    }
    formatterCache.set(key, formatter);
  }
  return formatter.format(toCents(toNumber(value)));
};
