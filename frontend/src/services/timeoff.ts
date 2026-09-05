import { api } from '@/lib/api';
import type { TimeOffType, LeaveAllocation, LeaveRequest } from '@/types';

export const timeoffApi = {
  getTypes: async (): Promise<TimeOffType[]> => {
    const res = await api.get<any>('/timeoff/types');
    return res.data?.data ?? res.data;
  },

  createType: async (payload: Partial<TimeOffType>): Promise<TimeOffType> => {
    const res = await api.post<any>('/timeoff/types', payload);
    return res.data?.data ?? res.data;
  },

  getAllocations: async (): Promise<LeaveAllocation[]> => {
    const res = await api.get<any>('/timeoff/allocations');
    return res.data?.data ?? res.data;
  },

  createAllocation: async (payload: Partial<LeaveAllocation>): Promise<LeaveAllocation> => {
    const res = await api.post<any>('/timeoff/allocations', payload);
    return res.data?.data ?? res.data;
  },

  getRequests: async (): Promise<LeaveRequest[]> => {
    const res = await api.get<any>('/timeoff/requests');
    return res.data?.data ?? res.data;
  },

  createRequest: async (payload: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const res = await api.post<any>('/timeoff/requests', payload);
    return res.data?.data ?? res.data;
  },

  approveRequest: async (id: string): Promise<LeaveRequest> => {
    const res = await api.patch<any>(`/timeoff/requests/${id}/approve`);
    return res.data?.data ?? res.data;
  },

  refuseRequest: async (id: string): Promise<LeaveRequest> => {
    const res = await api.patch<any>(`/timeoff/requests/${id}/refuse`);
    return res.data?.data ?? res.data;
  },
};
