import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/lib/auth-store';

// Login stays eager — it's the first thing an unauthenticated user sees
import { Login } from '@/features/auth/pages/Login';

// Lazy-loaded feature pages (each becomes its own chunk)
const UsersList = React.lazy(() => import('@/features/users/pages/UsersList').then(m => ({ default: m.UsersList })));
const EmployeesPage = React.lazy(() => import('@/features/employees/pages/EmployeesPage').then(m => ({ default: m.EmployeesPage })));
const EmployeeDetailPage = React.lazy(() => import('@/features/employees/pages/EmployeeDetailPage').then(m => ({ default: m.EmployeeDetailPage })));
const DepartmentsPage = React.lazy(() => import('@/features/employees/pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const SchedulesList = React.lazy(() => import('@/features/schedules/pages/SchedulesList').then(m => ({ default: m.SchedulesList })));
const ScheduleDetailPage = React.lazy(() => import('@/features/schedules/pages/ScheduleDetailPage').then(m => ({ default: m.ScheduleDetailPage })));
const ContractsList = React.lazy(() => import('@/features/contracts/pages/ContractsList').then(m => ({ default: m.ContractsList })));
const ContractDetailPage = React.lazy(() => import('@/features/contracts/pages/ContractDetailPage').then(m => ({ default: m.ContractDetailPage })));
const AttendanceList = React.lazy(() => import('@/features/attendance/pages/AttendanceList').then(m => ({ default: m.AttendanceList })));
const AttendanceDetailPage = React.lazy(() => import('@/features/attendance/pages/AttendanceDetailPage').then(m => ({ default: m.AttendanceDetailPage })));
const TimeOffDashboard = React.lazy(() => import('@/features/timeoff/pages/TimeOffDashboard').then(m => ({ default: m.TimeOffDashboard })));
const TimeOffTypesList = React.lazy(() => import('@/features/timeoff/types/pages/TimeOffTypesList').then(m => ({ default: m.TimeOffTypesList })));
const AllocationsList = React.lazy(() => import('@/features/timeoff/allocations/pages/AllocationsList').then(m => ({ default: m.AllocationsList })));
const RequestsList = React.lazy(() => import('@/features/timeoff/requests/pages/RequestsList').then(m => ({ default: m.RequestsList })));
const DashboardPage = React.lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PayrunsList = React.lazy(() => import('@/features/payroll/payruns/pages/PayrunsList').then(m => ({ default: m.PayrunsList })));
const PayrunDetailPage = React.lazy(() => import('@/features/payroll/payruns/pages/PayrunDetailPage').then(m => ({ default: m.PayrunDetailPage })));
const PayslipsList = React.lazy(() => import('@/features/payroll/payslips/pages/PayslipsList').then(m => ({ default: m.PayslipsList })));
const PayslipDetailPage = React.lazy(() => import('@/features/payroll/payslips/pages/PayslipDetailPage').then(m => ({ default: m.PayslipDetailPage })));
const SalaryStructuresList = React.lazy(() => import('@/features/payroll/structures/pages/SalaryStructuresList').then(m => ({ default: m.SalaryStructuresList })));
const SalaryStructureDetailPage = React.lazy(() => import('@/features/payroll/structures/pages/SalaryStructureDetailPage').then(m => ({ default: m.SalaryStructureDetailPage })));
const SalaryRulesList = React.lazy(() => import('@/features/payroll/rules/pages/SalaryRulesList').then(m => ({ default: m.SalaryRulesList })));

// Inline loading spinner for lazy routes
const RouteLoading: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]" />
  </div>
);

// Root redirect handler based on user role
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'EMPLOYEE') {
    return <Navigate to={`/employees/${user.employeeId || ''}`} replace />;
  }
  return <Navigate to="/payroll" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Root */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<RootRedirect />} />

            {/* Self-service & general authenticated routes */}
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/attendance/:id" element={<AttendanceDetailPage />} />
            <Route path="/timeoff" element={<TimeOffDashboard />} />
            <Route path="/timeoff/requests" element={<RequestsList />} />
            <Route path="/timeoff/allocations" element={<AllocationsList />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/payroll/payslips" element={<PayslipsList />} />
            <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />

            {/* HR Manager+ Routes */}
            <Route element={<ProtectedRoute roles={['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/schedules" element={<SchedulesList />} />
              <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
              <Route path="/contracts" element={<ContractsList />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/timeoff/types" element={<TimeOffTypesList />} />
            </Route>

            {/* Payroll User+ Routes */}
            <Route element={<ProtectedRoute roles={['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
              <Route path="/payroll" element={<DashboardPage />} />
              <Route path="/payroll/payruns" element={<PayrunsList />} />
              <Route path="/payroll/payruns/:id" element={<PayrunDetailPage />} />
              <Route path="/payroll/structures" element={<SalaryStructuresList />} />
              <Route path="/payroll/structures/:id" element={<SalaryStructureDetailPage />} />
              <Route path="/payroll/rules" element={<SalaryRulesList />} />
            </Route>

            {/* Admin-only Routes */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin/users" element={<UsersList />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};
