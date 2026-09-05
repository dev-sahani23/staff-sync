import { z } from 'zod';

export const DashboardFilterSchema = z.object({
  period: z.string().optional(), // e.g. "2026", "2026-09", "last_3_months"
  department: z.string().optional(),
  employeeType: z.string().optional(),
});

export type DashboardFilterInput = z.infer<typeof DashboardFilterSchema>;
