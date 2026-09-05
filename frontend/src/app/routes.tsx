import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/lib/auth-store';

// Feature Pages
import { Login } from '@/features/auth/pages/Login';
import { UsersList } from '@/features/users/pages/UsersList';
import { EmployeesPage } from '@/features/employees/pages/EmployeesPage';
import { EmployeeDetailPage } from '@/features/employees/pages/EmployeeDetailPage';
import { DepartmentsPage } from '@/features/employees/pages/DepartmentsPage';
import { SchedulesList } from '@/features/schedules/pages/SchedulesList';
import { ScheduleDetailPage } from '@/features/schedules/pages/ScheduleDetailPage';
import { ContractsList } from '@/features/contracts/pages/ContractsList';
import { ContractDetailPage } from '@/features/contracts/pages/ContractDetailPage';
import { AttendanceList } from '@/features/attendance/pages/AttendanceList';
import { AttendanceDetailPage } from '@/features/attendance/pages/AttendanceDetailPage';
import { TimeOffDashboard } from '@/features/timeoff/pages/TimeOffDashboard';
import { TimeOffTypesList } from '@/features/timeoff/types/pages/TimeOffTypesList';
import { AllocationsList } from '@/features/timeoff/allocations/pages/AllocationsList';
import { RequestsList } from '@/features/timeoff/requests/pages/RequestsList';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PayrunsList } from '@/features/payroll/payruns/pages/PayrunsList';
import { PayrunDetailPage } from '@/features/payroll/payruns/pages/PayrunDetailPage';
import { PayslipsList } from '@/features/payroll/payslips/pages/PayslipsList';
import { PayslipDetailPage } from '@/features/payroll/payslips/pages/PayslipDetailPage';
import { SalaryStructuresList } from '@/features/payroll/structures/pages/SalaryStructuresList';
import { SalaryStructureDetailPage } from '@/features/payroll/structures/pages/SalaryStructureDetailPage';
import { SalaryRulesList } from '@/features/payroll/rules/pages/SalaryRulesList';

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
  );
};
