import { dynamicT } from '@/i18n/dynamic';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuthRedux';

const Unauthorized = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface rounded-2xl shadow-sm text-center border border-line">
        <div>
          <div className="mx-auto h-12 w-12 text-danger">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-fg">
            {t('auth.accessDenied')}
          </h2>
          <p className="mt-2 text-center text-sm text-fg-muted">
            {t('auth.noPermission')}
          </p>
          {user && (
            <p className="mt-1 text-center text-xs text-fg-muted">
              {t('auth.currentRole', { role: dynamicT(`roles.${user.role}`, { defaultValue: user.role }) })}
            </p>
          )}
        </div>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {t('auth.goToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
