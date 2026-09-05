import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/components/AuthContext';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { Login } from './modules/auth/pages/Login';
import { Layout } from './components/layout/Layout';
import { Employees } from './modules/employee/pages/Employees';
import { EmployeeDetail } from './modules/employee/pages/EmployeeDetail';
import { Contracts } from './modules/contract/pages/Contracts';
import { ContractDetail } from './modules/contract/pages/ContractDetail';
import { Attendance } from './modules/attendance/pages/Attendance';
import { AttendanceDetail } from './modules/attendance/pages/AttendanceDetail.js';
import { Schedules } from './modules/schedule/pages/Schedules.js';
import { ScheduleDetail } from './modules/schedule/pages/ScheduleDetail.js';
import { Requests } from './modules/timeoff/pages/Requests';
import { RequestDetail } from './modules/timeoff/pages/RequestDetail';
import { Allocations } from './modules/timeoff/pages/Allocations';
import { AllocationDetail } from './modules/timeoff/pages/AllocationDetail';
import { TimeOffTypes } from './modules/timeoff/pages/TimeOffTypes';
import { TimeOffTypeDetail } from './modules/timeoff/pages/TimeOffTypeDetail';
import { Structures } from './modules/payroll/pages/Structures';
import { StructureDetail } from './modules/payroll/pages/StructureDetail';
import { Payruns } from './modules/payroll/pages/Payruns';
import { PayrunDetail } from './modules/payroll/pages/PayrunDetail';
import { Payslips } from './modules/payroll/pages/Payslips';
import { PayslipDetail } from './modules/payroll/pages/PayslipDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Can specify roles e.g. roles={['Admin', 'HR Manager']} for specific routes */}
              <Route path="/dashboard" element={<Employees />} />
              <Route path="/employee/:id" element={<EmployeeDetail />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/contract/:id" element={<ContractDetail />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/:id" element={<AttendanceDetail />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/schedules/:id" element={<ScheduleDetail />} />
              <Route path="/timeoff/requests" element={<Requests />} />
              <Route path="/timeoff/requests/:id" element={<RequestDetail />} />
              <Route path="/timeoff/allocations" element={<Allocations />} />
              <Route path="/timeoff/allocations/:id" element={<AllocationDetail />} />
              <Route path="/timeoff/types" element={<TimeOffTypes />} />
              <Route path="/timeoff/types/:id" element={<TimeOffTypeDetail />} />
              <Route path="/payroll/structures" element={<Structures />} />
              <Route path="/payroll/structures/:id" element={<StructureDetail />} />
              <Route path="/payroll/payruns" element={<Payruns />} />
              <Route path="/payroll/payruns/:id" element={<PayrunDetail />} />
              <Route path="/payroll/payslips" element={<Payslips />} />
              <Route path="/payroll/payslips/:id" element={<PayslipDetail />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
