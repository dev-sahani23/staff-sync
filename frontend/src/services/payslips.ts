import { api, API_BASE_URL } from '@/lib/api';
import type { Payslip } from '@/types';

export const payslipsApi = {
  getMyPayslips: async (): Promise<Payslip[]> => {
    const res = await api.get<any>('/payslips/my');
    return res.data?.data ?? res.data;
  },

  get: async (id: string): Promise<Payslip> => {
    const res = await api.get<any>(`/payslips/${id}`);
    return res.data?.data ?? res.data;
  },

  listAll: async (params?: { payrunId?: string; employeeId?: string; status?: string }): Promise<Payslip[]> => {
    try {
      // 1. If specific payrun, fetch directly from payrun detail
      if (params?.payrunId) {
        const res = await api.get<any>(`/payruns/${params.payrunId}`);
        const payrun = res.data?.data ?? res.data;
        return (payrun.payslips || []).map((s: any) => ({ ...s, payrun }));
      }

      // 2. Try direct /payslips endpoint first
      try {
        const res = await api.get<any>('/payslips', { params });
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch {
        // Fall through to payruns aggregation
      }

      // 3. Fetch all payruns and aggregate itemized payslips from payrun details
      const payrunsRes = await api.get<any>('/payruns');
      const payruns = payrunsRes.data?.data ?? payrunsRes.data;
      if (!Array.isArray(payruns) || payruns.length === 0) {
        return [];
      }

      const details = await Promise.all(
        payruns.map(async (pr: any) => {
          try {
            const detailRes = await api.get<any>(`/payruns/${pr.id}`);
            return detailRes.data?.data ?? detailRes.data;
          } catch {
            return null;
          }
        })
      );

      const allSlips: Payslip[] = [];
      for (const pr of details) {
        if (!pr || !Array.isArray(pr.payslips)) continue;
        for (const s of pr.payslips) {
          if (params?.employeeId && s.employeeId !== params.employeeId) continue;
          if (params?.status && s.status !== params.status) continue;
          allSlips.push({ ...s, payrun: pr });
        }
      }
      return allSlips;
    } catch {
      return [];
    }
  },

  getPdfUrl: (id: string): string => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/payslips/${id}/pdf?token=${token}`;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const res = await api.get(`/payslips/${id}/pdf`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
