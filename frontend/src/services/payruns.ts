import { api } from '@/lib/api';
import type { Payrun } from '@/types';

export interface PayrunDraftScopePayload {
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
}

export interface PayrunDraftPreview {
  periodStart: string;
  periodEnd: string;
  salaryStructureId: string;
  salaryStructureName?: string;
  totalEligible: number;
  eligibleEmployees: Array<{
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string | null;
    jobPosition?: string | null;
    contractWage?: number;
    wage?: number;
    hasBankDetails?: boolean;
  }>;
}

export interface CreatePayrunPayload {
  name: string;
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
  employeeIds: string[];
}

export const payrunsApi = {
  previewDraft: async (payload: PayrunDraftScopePayload): Promise<PayrunDraftPreview> => {
    const res = await api.post<any>('/payruns/draft', payload);
    const raw = res.data?.data ?? res.data;
    const rawList = Array.isArray(raw.eligibleEmployees) ? raw.eligibleEmployees : [];
    const eligibleEmployees = rawList.map((e: any) => ({
      id: e.employeeId || e.id,
      employeeId: e.employeeId || e.id,
      firstName: e.firstName || '',
      lastName: e.lastName || '',
      email: e.email || '',
      department: e.department || null,
      jobPosition: e.jobPosition || null,
      contractWage: Number(e.wage ?? e.contractWage ?? 0),
      wage: Number(e.wage ?? e.contractWage ?? 0),
      hasBankDetails: Boolean(e.hasBankDetails),
    }));

    return {
      periodStart: raw.periodStart || payload.periodStart,
      periodEnd: raw.periodEnd || payload.periodEnd,
      salaryStructureId: raw.salaryStructureId || payload.salaryStructureId,
      salaryStructureName: raw.salaryStructureName || '',
      totalEligible: Number(raw.totalEligibleCount ?? raw.totalEligible ?? eligibleEmployees.length),
      eligibleEmployees,
    };
  },

  create: async (payload: CreatePayrunPayload): Promise<Payrun> => {
    const res = await api.post<any>('/payruns', payload);
    return res.data?.data ?? res.data;
  },

  list: async (params?: { status?: string; salaryStructureId?: string }): Promise<Payrun[]> => {
    const res = await api.get<any>('/payruns', { params });
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<Payrun> => {
    const res = await api.get<any>(`/payruns/${id}`);
    return res.data?.data ?? res.data;
  },

  compute: async (id: string): Promise<Payrun> => {
    const res = await api.post<any>(`/payruns/${id}/compute`);
    return res.data?.data ?? res.data;
  },

  validate: async (id: string): Promise<Payrun> => {
    const res = await api.patch<any>(`/payruns/${id}/validate`);
    return res.data?.data ?? res.data;
  },

  markPaid: async (id: string): Promise<Payrun> => {
    const res = await api.patch<any>(`/payruns/${id}/mark-paid`);
    return res.data?.data ?? res.data;
  },

  sendPayslips: async (id: string): Promise<{ sentCount: number; message: string }> => {
    const res = await api.post<any>(`/payruns/${id}/send`);
    return res.data?.data ?? res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/payruns/${id}`);
  },
};
