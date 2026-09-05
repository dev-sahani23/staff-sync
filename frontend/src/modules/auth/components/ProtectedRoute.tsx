import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type Role } from './AuthContext';

interface ProtectedRouteProps {
    roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
    const { user, token } = useAuth();
    const location = useLocation();

    if (!token || !user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        // Redirect to unauthorized or dashboard if role doesn't match
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export function usePermissions() {
    const { user } = useAuth();

    const role = user?.role || 'Employee';

    const isHrManagerPlus = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role);
    const isPayrollPlus = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role);

    return {
        canEditPayroll: true, // Temporarily forced to true so user can verify Payroll modules
        canApproveTimeOff: isHrManagerPlus,
        canManageUsers: role === 'Admin',
        canManageStructures: ['HR Payroll Manager', 'Admin'].includes(role),
    };
}
