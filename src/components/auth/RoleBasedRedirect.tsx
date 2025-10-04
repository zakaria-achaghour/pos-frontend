import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const RoleBasedRedirect = () => {
  const { user, isLoading, getRoleBasedRedirect } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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