import { z } from 'zod';

export const PayrunDraftScopeSchema = z
  .object({
    salaryStructureId: z.string().uuid('Valid Salary Structure ID is required'),
    periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format: YYYY-MM-DD')),
    periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format: YYYY-MM-DD')),
  })
  .refine(
    (data) => new Date(data.periodEnd) >= new Date(data.periodStart),
    {
      message: 'periodEnd must be on or after periodStart',
      path: ['periodEnd'],
    }
  );

export const CreatePayrunSchema = z
  .object({
    name: z.string().min(2, 'Payrun batch name is required (e.g. September 2026 Payroll)'),
    salaryStructureId: z.string().uuid('Valid Salary Structure ID is required'),
    periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format: YYYY-MM-DD')),
    periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format: YYYY-MM-DD')),
    employeeIds: z.array(z.string().uuid()).min(1, 'At least one employee must be selected'),
  })
  .refine(
    (data) => new Date(data.periodEnd) >= new Date(data.periodStart),
    {
      message: 'periodEnd must be on or after periodStart',
      path: ['periodEnd'],
    }
  );

export const PayrunQueryFilterSchema = z.object({
  status: z.enum(['DRAFT', 'COMPUTED', 'VALIDATED', 'PAID']).optional(),
  salaryStructureId: z.string().uuid().optional(),
});

export type PayrunDraftScopeInput = z.infer<typeof PayrunDraftScopeSchema>;
export type CreatePayrunInput = z.infer<typeof CreatePayrunSchema>;
export type PayrunQueryFilterInput = z.infer<typeof PayrunQueryFilterSchema>;
