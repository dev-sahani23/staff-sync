import { api } from '@/lib/api';
import type { Contract } from '@/types';

export interface ContractLookupParams {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
}

export const contractsApi = {
  list: async (): Promise<Contract[]> => {
    const res = await api.get<any>('/contracts');
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<Contract> => {
    const all = await contractsApi.list();
    const found = all.find((c) => c.id === id);
    if (!found) throw new Error('Contract not found');
    return found;
  },

  create: async (payload: Partial<Contract>): Promise<Contract> => {
    const res = await api.post<any>('/contracts', payload);
    return res.data?.data ?? res.data;
  },

  update: async (id: string, payload: Partial<Contract>): Promise<Contract> => {
    const res = await api.patch<any>(`/contracts/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  activate: async (id: string): Promise<Contract> => {
    const res = await api.patch<any>(`/contracts/${id}/activate`);
    return res.data?.data ?? res.data;
  },

  lookup: async (params: ContractLookupParams): Promise<Contract> => {
    const res = await api.get<any>('/contracts/lookup', { params });
    return res.data?.data ?? res.data;
  },
};
