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

// ── Standardised permission helpers (PS-aligned) ───────────────────
const HR_MANAGER_PLUS: Role[] = ['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'];
const PAYROLL_USER_PLUS: Role[] = ['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'];
const PAYROLL_MANAGER_PLUS: Role[] = ['HR_PAYROLL_MANAGER', 'ADMIN'];

export function usePermissions() {
    const { user } = useAuth();

    const role = user?.role || 'EMPLOYEE';

    const isHR = HR_MANAGER_PLUS.includes(role);
    const isPayrollUser = PAYROLL_USER_PLUS.includes(role);
    const isPayrollManager = PAYROLL_MANAGER_PLUS.includes(role);
    const isAdmin = role === 'ADMIN';
    const isEmployee = role === 'EMPLOYEE';

    return {
        // Can view global employee list, contracts, departments
        canViewHR: isHR,
        // Can create / update employees, contracts
        canEditHR: isHR,
        // Can view / compute payroll
        canViewPayroll: isPayrollUser,
        canEditPayroll: isPayrollUser,
        // Can approve/validate payruns, manage salary structures
        canManageStructures: isPayrollManager,
        // Can approve time off, correct attendance
        canApproveTimeOff: isHR,
        // Full admin access
        canManageUsers: isAdmin,
        // Standard employee – self-service only
        isEmployee,
    const isHrManagerPlus = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role);
    const isPayrollPlus = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role);

    return {
        canEditPayroll: true, // Temporarily forced to true so user can verify Payroll modules
        canApproveTimeOff: isHrManagerPlus,
        canManageUsers: role === 'Admin',
        canManageStructures: ['HR Payroll Manager', 'Admin'].includes(role),
    };
}
