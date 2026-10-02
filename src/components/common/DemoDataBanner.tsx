import { useTranslation } from 'react-i18next';

// Shown on screens whose numbers are placeholders until the backend endpoint exists
export default function DemoDataBanner() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning"
    >
      {t('dashboard.demoBanner')}
    </div>
  );
}
