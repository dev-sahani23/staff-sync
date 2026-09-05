import { evaluateFormula } from './formula-evaluator.ts';
import type {
  SalaryRuleComputationInput,
  EmployeeSalaryContext,
  ComputedPayslipLine,
  SalaryEngineResult,
} from './salary-engine.types.ts';

export class SalaryEngineService {
  /**
   * Pure calculation engine: takes employee context & rules, returns itemized lines and totals.
   */
  compute(
    empContext: EmployeeSalaryContext,
    rules: SalaryRuleComputationInput[]
  ): SalaryEngineResult {
    // 1. Sort rules strictly by sequence ascending
    const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

    // 2. Initialize execution context
    const totalDays = empContext.totalWorkingDays || 30;
    const workedDays = empContext.workedDays;
    const attendanceRatio = totalDays > 0 ? Math.min(workedDays / totalDays, 1.0) : 1.0;

    const context: Record<string, number> = {
      WAGE: empContext.contractWage,
      WORKED_DAYS: workedDays,
      TOTAL_DAYS: totalDays,
      ATTENDANCE_RATIO: attendanceRatio,
      ...(empContext.customInputs || {}),
    };

    const lines: ComputedPayslipLine[] = [];
    let grossTotal = 0;
    let deductionsTotal = 0;
    let explicitNetAmount: number | null = null;

    // 3. Sequential rule execution
    for (const rule of sortedRules) {
      const codeUpper = rule.code.toUpperCase();
      let ruleAmount = 0;

      switch (rule.computeMethod) {
        case 'FIXED': {
          ruleAmount = rule.amount ?? 0;
          break;
        }

        case 'PERCENTAGE': {
          const baseKey = rule.baseCode ? rule.baseCode.toUpperCase() : 'WAGE';
          const baseValue = context[baseKey] ?? 0;
          const percentageRate = rule.amount ?? 0;
          ruleAmount = baseValue * (percentageRate / 100);
          break;
        }

        case 'FORMULA': {
          if (!rule.formula) {
            throw new Error(`Formula missing for rule '${rule.name}' (${rule.code})`);
          }
          ruleAmount = evaluateFormula(rule.formula, context);
          break;
        }

        default: {
          throw new Error(`Unsupported computeMethod '${rule.computeMethod}' for rule '${rule.code}'`);
        }
      }

      // Round rule amount to 2 decimal places
      ruleAmount = Math.round(ruleAmount * 100) / 100;

      // Update context so subsequent rules can reference this rule's output
      context[codeUpper] = ruleAmount;

      // Add to payslip lines
      lines.push({
        salaryRuleId: rule.id,
        code: codeUpper,
        label: rule.name,
        category: rule.category,
        sequence: rule.sequence,
        amount: ruleAmount,
      });

      // Accumulate totals by category
      if (rule.category === 'BASIC' || rule.category === 'ALLOWANCE') {
        grossTotal += ruleAmount;
      } else if (rule.category === 'DEDUCTION') {
        deductionsTotal += ruleAmount;
      } else if (rule.category === 'GROSS') {
        // If an explicit GROSS rule is calculated, we can use its evaluated amount
        grossTotal = ruleAmount;
      } else if (rule.category === 'NET' || codeUpper === 'NET') {
        explicitNetAmount = ruleAmount;
      }
    }

    // Finalize gross & deductions rounding
    grossTotal = Math.round(grossTotal * 100) / 100;
    deductionsTotal = Math.round(deductionsTotal * 100) / 100;

    // Compute netTotal
    const netTotal =
      explicitNetAmount !== null
        ? Math.round(explicitNetAmount * 100) / 100
        : Math.round((grossTotal - deductionsTotal) * 100) / 100;

    return {
      lines,
      grossTotal,
      deductionsTotal,
      netTotal,
      context,
    };
  }
}

export const salaryEngineService = new SalaryEngineService();
