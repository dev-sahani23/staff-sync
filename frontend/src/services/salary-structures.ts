import { api } from '@/lib/api';
import type { SalaryStructure, SalaryRule } from '@/types';

export const salaryStructuresApi = {
  list: async (): Promise<SalaryStructure[]> => {
    const res = await api.get<any>('/salary-structures');
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<SalaryStructure> => {
    const res = await api.get<any>(`/salary-structures/${id}`);
    return res.data?.data ?? res.data;
  },

  create: async (payload: Partial<SalaryStructure>): Promise<SalaryStructure> => {
    const res = await api.post<any>('/salary-structures', payload);
    return res.data?.data ?? res.data;
  },

  update: async (id: string, payload: Partial<SalaryStructure>): Promise<SalaryStructure> => {
    const res = await api.patch<any>(`/salary-structures/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/salary-structures/${id}`);
  },

  addRule: async (structureId: string, rule: Partial<SalaryRule>): Promise<SalaryRule> => {
    const res = await api.post<any>(`/salary-structures/${structureId}/rules`, rule);
    return res.data?.data ?? res.data;
  },

  updateRule: async (structureId: string, ruleId: string, rule: Partial<SalaryRule>): Promise<SalaryRule> => {
    const res = await api.patch<any>(`/salary-structures/${structureId}/rules/${ruleId}`, rule);
    return res.data?.data ?? res.data;
  },

  deleteRule: async (structureId: string, ruleId: string): Promise<void> => {
    await api.delete(`/salary-structures/${structureId}/rules/${ruleId}`);
  },
};
