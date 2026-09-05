import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-store';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F5D82]" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // If not authorized for this role, redirect to appropriate landing page
    if (user.role === 'EMPLOYEE') {
      return <Navigate to={`/employees/${user.employeeId || ''}`} replace />;
    }
    return <Navigate to="/payroll" replace />;
  }

  return <Outlet />;
};
