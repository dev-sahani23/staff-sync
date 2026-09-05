import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePermissions } from './ProtectedRoute';
import { Employees } from '@/modules/employee/pages/Employees';

/**
 * Smart redirect for /dashboard:
 * - HR Manager+ → shows the global Employees list (HR dashboard)
 * - Standard Employee → redirects to their own profile detail page
 */
export function DashboardRedirect() {
    const { user } = useAuth();
    const { isEmployee } = usePermissions();

    if (isEmployee && user?.employeeId) {
        return <Navigate to={`/employee/${user.employeeId}`} replace />;
    }

    // HR Manager+ sees the full employee list
    return <Employees />;
}
