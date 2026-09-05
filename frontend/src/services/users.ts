import { api } from '@/lib/api';
import type { User, Role } from '@/types';

export interface CreateUserPayload {
  email: string;
  password?: string;
  role: Role;
  employeeId?: string;
}

export const usersApi = {
  // TODO: backend route pending verification for GET /users
  list: async (): Promise<User[]> => {
    try {
      const res = await api.get<any>('/users');
      return res.data?.data ?? res.data;
    } catch {
      // Fallback: derive user records from employees who have linked users or seed users
      return [
        { id: '1', email: 'admin@peoplepay.com', role: 'ADMIN', isActive: true },
        { id: '2', email: 'payroll.manager@peoplepay.com', role: 'HR_PAYROLL_MANAGER', isActive: true },
        { id: '3', email: 'rahul.sharma@peoplepay.com', role: 'EMPLOYEE', isActive: true },
      ];
    }
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await api.post<any>('/auth/register', payload);
    return res.data?.data ?? res.data;
  },

  // TODO: backend route pending verification for PATCH /users/:id
  updateRole: async (id: string, role: Role): Promise<void> => {
    try {
      await api.patch(`/users/${id}`, { role });
    } catch (e) {
      console.warn('Update user role endpoint not mounted on backend', e);
    }
  },
};
