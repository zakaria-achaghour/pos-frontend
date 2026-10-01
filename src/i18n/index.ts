import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'pos_language';
const isSupported = (code: string | null | undefined): code is LanguageCode =>
  LANGUAGES.some((l) => l.code === code);

const readStored = (): LanguageCode | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
};

const detectLanguage = (): LanguageCode => {
  const stored = readStored();
  if (stored) return stored;
  const browser = (typeof navigator !== 'undefined' ? navigator.language : '').slice(0, 2).toLowerCase();
  return isSupported(browser) ? browser : 'en';
};

/** Keep <html lang dir> in sync so Tailwind logical classes and rtl: variants flip the layout. */
const applyDocumentLanguage = (code: string) => {
  const lang = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.dir;
};

// Locale files are large: load only English (the fallback) and the active language, on demand
const loaders: Record<LanguageCode, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en.json'),
  fr: () => import('./locales/fr.json'),
  ar: () => import('./locales/ar.json'),
};

const loadLanguage = async (code: LanguageCode): Promise<void> => {
  if (i18n.hasResourceBundle(code, 'translation')) return;
  const module = await loaders[code]();
  i18n.addResourceBundle(code, 'translation', module.default, true, true);
};

/** Switch language after its strings are loaded (so the UI never flashes keys). */
export const changeLanguage = async (code: string): Promise<void> => {
  if (!isSupported(code)) return;
  await loadLanguage(code);
  await i18n.changeLanguage(code);
};

const initialLanguage = detectLanguage();

void i18n.use(initReactI18next).init({
  resources: {},
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
  react: { useSuspense: false },
});

/** Resolves once English and the starting language are loaded; render the app after this. */
export const i18nReady: Promise<void> = Promise.all([loadLanguage('en'), loadLanguage(initialLanguage)]).then(() => {
  // re-emit so components that rendered before the bundles arrived pick up the strings
  void i18n.changeLanguage(initialLanguage);
});

applyDocumentLanguage(i18n.language);
i18n.on('languageChanged', (code) => {
  applyDocumentLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // storage unavailable (private mode): language just won't persist
  }
});

export default i18n;
