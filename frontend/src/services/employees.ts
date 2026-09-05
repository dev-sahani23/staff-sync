import { api } from '@/lib/api';
import type { Employee, Contract, Attendance, LeaveRequest, LeaveAllocation } from '@/types';

export interface EmployeeListParams {
  department?: string;
  status?: string;
  managerId?: string;
}

export const employeesApi = {
  list: async (params?: EmployeeListParams): Promise<Employee[]> => {
    const res = await api.get<any>('/employees', { params });
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<Employee> => {
    const res = await api.get<any>(`/employees/${id}`);
    return res.data?.data ?? res.data;
  },

  create: async (payload: Partial<Employee>): Promise<Employee> => {
    const res = await api.post<any>('/employees', payload);
    return res.data?.data ?? res.data;
  },

  update: async (id: string, payload: Partial<Employee>): Promise<Employee> => {
    const res = await api.patch<any>(`/employees/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  getContracts: async (id: string): Promise<Contract[]> => {
    const res = await api.get<any>(`/employees/${id}/contracts`);
    return res.data?.data ?? res.data;
  },

  getAttendance: async (id: string): Promise<Attendance[]> => {
    const res = await api.get<any>(`/employees/${id}/attendance`);
    return res.data?.data ?? res.data;
  },

  getTimeOff: async (id: string): Promise<LeaveRequest[]> => {
    const res = await api.get<any>(`/employees/${id}/timeoff`);
    return res.data?.data ?? res.data;
  },

  getAllocations: async (id: string): Promise<LeaveAllocation[]> => {
    const res = await api.get<any>(`/employees/${id}/allocations`);
    return res.data?.data ?? res.data;
  },
};
