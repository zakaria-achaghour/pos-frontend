import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuthRedux';

const RoleBasedRedirect = () => {
  const { t } = useTranslation();
  const { user, isLoading, getRoleBasedRedirect } = useAuth();

  if (isLoading) {
    return (
      <div role="status" aria-label={t('common.loading')} className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath = getRoleBasedRedirect();
  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedRedirect;