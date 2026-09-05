import React from 'react';
import { useAuth } from './auth-store';
import type { Role } from '@/types';

export type Permission =
  | 'employees:read'
  | 'employees:write'
  | 'contracts:read'
  | 'contracts:write'
  | 'schedules:read'
  | 'schedules:write'
  | 'attendance:read'
  | 'attendance:write'
  | 'timeoff:read'
  | 'timeoff:write'
  | 'timeoff:approve'
  | 'payroll:read'
  | 'payroll:write'
  | 'payroll:approve'
  | 'structures:read'
  | 'structures:write'
  | 'admin:users';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  EMPLOYEE: [
    'attendance:write', // self check-in/out
    'timeoff:write',    // self request
  ],
  HR_MANAGER: [
    'employees:read', 'employees:write',
    'contracts:read', 'contracts:write',
    'schedules:read', 'schedules:write',
    'attendance:read', 'attendance:write',
    'timeoff:read', 'timeoff:write', 'timeoff:approve',
  ],
  HR_PAYROLL_USER: [
    'employees:read', 'employees:write',
    'contracts:read', 'contracts:write',
    'schedules:read', 'schedules:write',
    'attendance:read', 'attendance:write',
    'timeoff:read', 'timeoff:write', 'timeoff:approve',
    'payroll:read', 'payroll:write',
    'structures:read',
  ],
  HR_PAYROLL_MANAGER: [
    'employees:read', 'employees:write',
    'contracts:read', 'contracts:write',
    'schedules:read', 'schedules:write',
    'attendance:read', 'attendance:write',
    'timeoff:read', 'timeoff:write', 'timeoff:approve',
    'payroll:read', 'payroll:write', 'payroll:approve',
    'structures:read', 'structures:write',
  ],
  ADMIN: [
    'employees:read', 'employees:write',
    'contracts:read', 'contracts:write',
    'schedules:read', 'schedules:write',
    'attendance:read', 'attendance:write',
    'timeoff:read', 'timeoff:write', 'timeoff:approve',
    'payroll:read', 'payroll:write', 'payroll:approve',
    'structures:read', 'structures:write',
    'admin:users',
  ],
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';
  const permissions = ROLE_PERMISSIONS[role] || [];

  const can = (permission: Permission) => permissions.includes(permission);

  return {
    role,
    isEmployee: role === 'EMPLOYEE',
    isHR: ['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role),
    isPayrollUser: ['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role),
    isPayrollManager: ['HR_PAYROLL_MANAGER', 'ADMIN'].includes(role),
    isAdmin: role === 'ADMIN',

    // Specific permissions
    can,
    canManageEmployees: can('employees:write'),
    canManageContracts: can('contracts:write'),
    canManageSchedules: can('schedules:write'),
    canManageAttendance: can('attendance:write'),
    canApproveTimeOff: can('timeoff:approve'),
    canViewPayroll: can('payroll:read'),
    canEditPayroll: can('payroll:write'),
    canApprovePayroll: can('payroll:approve'),
    canViewStructures: can('structures:read'),
    canManageStructures: can('structures:write'),
    canManageUsers: can('admin:users'),
  };
}

interface CanProps {
  permission?: Permission;
  roles?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ permission, roles, children, fallback = null }) => {
  const { role, can } = usePermissions();

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <>{fallback}</>;
  }

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
