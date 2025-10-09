import React from 'react';
import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuthRedux';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen'>;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('🛡️ ProtectedRoute Check:', {
    isLoading,
    isAuthenticated,
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    allowedRoles,
    path: window.location.pathname
  });

  if (isLoading) {
    console.log('⏳ Auth still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('🚫 User role not allowed:', { userRole: user.role, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;