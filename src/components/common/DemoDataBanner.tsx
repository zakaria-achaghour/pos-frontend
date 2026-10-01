import { useTranslation } from 'react-i18next';

// Shown on screens whose numbers are placeholders until the backend endpoint exists
export default function DemoDataBanner() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200"
    >
      {t('dashboard.demoBanner')}
    </div>
  );
}
