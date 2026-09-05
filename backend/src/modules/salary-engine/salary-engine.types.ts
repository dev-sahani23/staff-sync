import type { RuleCategory, ComputeMethod } from '@prisma/client';

export interface SalaryRuleComputationInput {
  id?: string;
  code: string;
  name: string;
  category: RuleCategory;
  sequence: number;
  computeMethod: ComputeMethod;
  amount?: number | null;
  baseCode?: string | null;
  formula?: string | null;
}

export interface EmployeeSalaryContext {
  employeeId?: string;
  contractWage: number;
  workedDays: number;
  totalWorkingDays?: number;
  customInputs?: Record<string, number>;
}

export interface ComputedPayslipLine {
  salaryRuleId?: string;
  code: string;
  label: string;
  category: RuleCategory;
  sequence: number;
  amount: number;
}

export interface SalaryEngineResult {
  lines: ComputedPayslipLine[];
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
  context: Record<string, number>;
}
