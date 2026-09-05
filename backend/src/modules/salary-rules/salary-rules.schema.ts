import { z } from 'zod';

export const RuleCategoryEnum = z.enum([
  'BASIC',
  'ALLOWANCE',
  'DEDUCTION',
  'GROSS',
  'NET',
]);

export const ComputeMethodEnum = z.enum([
  'FIXED',
  'PERCENTAGE',
  'FORMULA',
]);

export const CreateSalaryStructureSchema = z.object({
  name: z.string().min(2, 'Structure name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const UpdateSalaryStructureSchema = CreateSalaryStructureSchema.partial();

export const CreateSalaryRuleSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Rule code is required')
      .regex(/^[A-Z0-9_]+$/, 'Rule code must be uppercase alphanumeric and underscores only (e.g. BASIC, HRA, PF)'),
    name: z.string().min(1, 'Rule name is required'),
    category: RuleCategoryEnum,
    sequence: z.number().int().positive('Sequence must be a positive integer'),
    computeMethod: ComputeMethodEnum,
    amount: z.number().optional(),
    baseCode: z.string().optional(),
    formula: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.computeMethod === 'FIXED') {
      if (data.amount === undefined || data.amount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount is required for FIXED computation method',
          path: ['amount'],
        });
      }
    } else if (data.computeMethod === 'PERCENTAGE') {
      if (data.amount === undefined || data.amount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percentage rate (amount) is required for PERCENTAGE computation method',
          path: ['amount'],
        });
      }
      if (!data.baseCode || data.baseCode.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'baseCode is required for PERCENTAGE computation method',
          path: ['baseCode'],
        });
      }
    } else if (data.computeMethod === 'FORMULA') {
      if (!data.formula || data.formula.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Formula expression string is required for FORMULA computation method',
          path: ['formula'],
        });
      }
    }
  });

export const UpdateSalaryRuleSchema = z
  .object({
    code: z
      .string()
      .regex(/^[A-Z0-9_]+$/, 'Rule code must be uppercase alphanumeric and underscores')
      .optional(),
    name: z.string().min(1).optional(),
    category: RuleCategoryEnum.optional(),
    sequence: z.number().int().positive().optional(),
    computeMethod: ComputeMethodEnum.optional(),
    amount: z.number().optional(),
    baseCode: z.string().optional(),
    formula: z.string().optional(),
  });

export type CreateSalaryStructureInput = z.infer<typeof CreateSalaryStructureSchema>;
export type UpdateSalaryStructureInput = z.infer<typeof UpdateSalaryStructureSchema>;
export type CreateSalaryRuleInput = z.infer<typeof CreateSalaryRuleSchema>;
export type UpdateSalaryRuleInput = z.infer<typeof UpdateSalaryRuleSchema>;
