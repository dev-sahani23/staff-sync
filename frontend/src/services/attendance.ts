import { api } from '@/lib/api';
import type { Attendance } from '@/types';

export interface AttendanceListParams {
  employeeId?: string;
  date?: string;
  status?: string;
}

export const attendanceApi = {
  list: async (params?: AttendanceListParams): Promise<Attendance[]> => {
    const res = await api.get<any>('/attendance', { params });
    return res.data?.data ?? res.data;
  },

  checkIn: async (employeeId?: string): Promise<Attendance> => {
    const res = await api.post<any>('/attendance/check-in', { employeeId });
    return res.data?.data ?? res.data;
  },

  checkOut: async (id: string): Promise<Attendance> => {
    const res = await api.post<any>(`/attendance/${id}/check-out`);
    return res.data?.data ?? res.data;
  },

  correct: async (id: string, payload: Partial<Attendance>): Promise<Attendance> => {
    const res = await api.patch<any>(`/attendance/${id}/correct`, payload);
    return res.data?.data ?? res.data;
  },
};
