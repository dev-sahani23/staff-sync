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
