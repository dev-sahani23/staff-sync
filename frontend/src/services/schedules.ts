import { api } from '@/lib/api';
import type { WorkingSchedule } from '@/types';

export const schedulesApi = {
  list: async (): Promise<WorkingSchedule[]> => {
    const res = await api.get<any>('/schedules');
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<WorkingSchedule> => {
    const res = await api.get<any>(`/schedules/${id}`);
    return res.data?.data ?? res.data;
  },

  create: async (payload: Partial<WorkingSchedule>): Promise<WorkingSchedule> => {
    const res = await api.post<any>('/schedules', payload);
    return res.data?.data ?? res.data;
  },

  update: async (id: string, payload: Partial<WorkingSchedule>): Promise<WorkingSchedule> => {
    const res = await api.put<any>(`/schedules/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
};
