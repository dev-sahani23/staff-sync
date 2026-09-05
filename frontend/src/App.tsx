import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/components/AuthContext';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { Login } from './modules/auth/pages/Login';
import { Register } from './modules/auth/pages/Register';
import { Layout } from './components/layout/Layout';
import { Employees } from './modules/employee/pages/Employees';
import { EmployeeDetail } from './modules/employee/pages/EmployeeDetail';
import { Contracts } from './modules/contract/pages/Contracts';
import { ContractDetail } from './modules/contract/pages/ContractDetail';
import { Attendance } from './modules/attendance/pages/Attendance';
import { DashboardRedirect } from './modules/auth/components/DashboardRedirect.js';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes – any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Smart redirect: HR+ → employee list, Employee → own profile */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Employee detail – all authenticated (scoped on backend) */}
              <Route path="/employee/:id" element={<EmployeeDetail />} />

              {/* Attendance – all authenticated (scoped on backend) */}
              <Route path="/attendance" element={<Attendance />} />
            </Route>
          </Route>

          {/* Protected Routes – HR Manager+ only */}
          <Route element={<ProtectedRoute roles={['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/contract/:id" element={<ContractDetail />} />
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
