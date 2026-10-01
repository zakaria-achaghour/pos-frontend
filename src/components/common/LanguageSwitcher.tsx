import { useTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage } from '@/i18n';

/** Compact language picker for the header. */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <label className={`inline-flex items-center ${className}`}>
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={i18n.resolvedLanguage}
        onChange={(e) => void changeLanguage(e.target.value)}
        className="h-11 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
