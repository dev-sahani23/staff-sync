import { api } from '@/lib/api';
import type { DashboardKpis } from '@/types';

export interface SalaryCostByDepartment {
  department: string;
  totalCost: number;
  employeeCount: number;
}

export interface MonthlyNetTrend {
  month: string;
  netSalaryPaid: number;
  totalGross: number;
  gross?: number;
  totalNet?: number;
  net?: number;
  payslipsCount?: number;
}

export interface AttendanceOverview {
  present: number;
  late: number;
  absent: number;
  exceptions: number;
  corrected: number;
  total: number;
}

export interface OperationalAlerts {
  payrollWarnings: Array<{
    id: string;
    employeeName: string;
    issue: string;
  }>;
  expiringContracts: Array<{
    id: string;
    employeeName: string;
    endDate: string;
    daysRemaining: number;
  }>;
}

export const dashboardApi = {
  getKpis: async (filters?: { department?: string }): Promise<DashboardKpis> => {
    const res = await api.get<any>('/dashboard/kpis', { params: filters });
    return res.data?.data ?? res.data;
  },

  getSalaryCostByDepartment: async (filters?: { department?: string }): Promise<SalaryCostByDepartment[]> => {
    const res = await api.get<any>('/dashboard/salary-cost-by-department', { params: filters });
    return res.data?.data ?? res.data;
  },

  getMonthlyNetTrend: async (): Promise<MonthlyNetTrend[]> => {
    const res = await api.get<any>('/dashboard/monthly-net-trend');
    return res.data?.data ?? res.data;
  },

  getAttendanceOverview: async (): Promise<AttendanceOverview> => {
    const res = await api.get<any>('/dashboard/attendance-overview');
    return res.data?.data ?? res.data;
  },

  getAlerts: async (): Promise<OperationalAlerts> => {
    const res = await api.get<any>('/dashboard/alerts');
    return res.data?.data ?? res.data;
  },
};
