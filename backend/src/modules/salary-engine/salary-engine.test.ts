import { salaryEngineService } from './salary-engine.service.ts';
import type { SalaryRuleComputationInput, EmployeeSalaryContext } from './salary-engine.types.ts';

function runSalaryEngineTests() {
  console.log('🧪 Starting Salary Computation Engine Unit Tests...\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error('     Details:', JSON.stringify(details, null, 2));
    }
  }

  // TEST 1: Fixed + Percentage + Formula Standard Structure
  {
    const wage = 60000;
    const workedDays = 30;
    const totalDays = 30;

    const rules: SalaryRuleComputationInput[] = [
      {
        code: 'BASIC',
        name: 'Basic Salary',
        category: 'BASIC',
        sequence: 1,
        computeMethod: 'PERCENTAGE',
        amount: 50, // 50% of WAGE = 30,000
        baseCode: 'WAGE',
      },
      {
        code: 'HRA',
        name: 'House Rent Allowance',
        category: 'ALLOWANCE',
        sequence: 2,
        computeMethod: 'PERCENTAGE',
        amount: 40, // 40% of BASIC = 12,000
        baseCode: 'BASIC',
      },
      {
        code: 'CONVEYANCE',
        name: 'Conveyance Allowance',
        category: 'ALLOWANCE',
        sequence: 3,
        computeMethod: 'FIXED',
        amount: 3000,
      },
      {
        code: 'SPECIAL',
        name: 'Special Allowance',
        category: 'ALLOWANCE',
        sequence: 4,
        computeMethod: 'FORMULA',
        formula: 'WAGE - BASIC - HRA - CONVEYANCE', // 60,000 - 30,000 - 12,000 - 3,000 = 15,000
      },
      {
        code: 'PF',
        name: 'Provident Fund',
        category: 'DEDUCTION',
        sequence: 5,
        computeMethod: 'PERCENTAGE',
        amount: 12, // 12% of BASIC = 3,600
        baseCode: 'BASIC',
      },
      {
        code: 'PT',
        name: 'Professional Tax',
        category: 'DEDUCTION',
        sequence: 6,
        computeMethod: 'FIXED',
        amount: 200,
      },
      {
        code: 'NET',
        name: 'Net Salary',
        category: 'NET',
        sequence: 7,
        computeMethod: 'FORMULA',
        formula: 'BASIC + HRA + CONVEYANCE + SPECIAL - PF - PT', // 60,000 - 3,800 = 56,200
      },
    ];

    const context: EmployeeSalaryContext = {
      contractWage: wage,
      workedDays,
      totalWorkingDays: totalDays,
    };

    const result = salaryEngineService.compute(context, rules);

    assert(result.context['BASIC'] === 30000, 'Basic Salary is 50% of Wage (30,000)', result.context);
    assert(result.context['HRA'] === 12000, 'HRA is 40% of Basic (12,000)', result.context);
    assert(result.context['CONVEYANCE'] === 3000, 'Conveyance is Fixed 3,000', result.context);
    assert(result.context['SPECIAL'] === 15000, 'Special Allowance formula evaluates to 15,000', result.context);
    assert(result.context['PF'] === 3600, 'PF is 12% of Basic (3,600)', result.context);
    assert(result.context['PT'] === 200, 'Professional Tax is 200', result.context);
    assert(result.grossTotal === 60000, 'Gross Total is 60,000', { grossTotal: result.grossTotal });
    assert(result.deductionsTotal === 3800, 'Deductions Total is 3,800', { deductionsTotal: result.deductionsTotal });
    assert(result.netTotal === 56200, 'Net Total matches 56,200', { netTotal: result.netTotal });
    assert(result.lines.length === 7, 'Generates exactly 7 itemized payslip lines', { linesCount: result.lines.length });
  }

  // TEST 2: Attendance Prorated Salary
  {
    const wage = 50000;
    const workedDays = 15; // 50% attendance
    const totalDays = 30;

    const rules: SalaryRuleComputationInput[] = [
      {
        code: 'BASIC',
        name: 'Basic Pay',
        category: 'BASIC',
        sequence: 1,
        computeMethod: 'FORMULA',
        formula: 'WAGE * (WORKED_DAYS / TOTAL_DAYS)', // 50,000 * (15/30) = 25,000
      },
      {
        code: 'HRA',
        name: 'HRA',
        category: 'ALLOWANCE',
        sequence: 2,
        computeMethod: 'PERCENTAGE',
        amount: 50, // 50% of 25,000 = 12,500
        baseCode: 'BASIC',
      },
      {
        code: 'DED',
        name: 'Flat Deductions',
        category: 'DEDUCTION',
        sequence: 3,
        computeMethod: 'FIXED',
        amount: 1000,
      },
    ];

    const context: EmployeeSalaryContext = {
      contractWage: wage,
      workedDays,
      totalWorkingDays: totalDays,
    };

    const result = salaryEngineService.compute(context, rules);

    assert(result.context['BASIC'] === 25000, 'Prorated Basic matches 25,000 for 15 worked days', result.context);
    assert(result.context['HRA'] === 12500, 'HRA computed on prorated Basic (12,500)', result.context);
    assert(result.grossTotal === 37500, 'Gross total equals 37,500', { gross: result.grossTotal });
    assert(result.deductionsTotal === 1000, 'Deductions total equals 1,000', { deductions: result.deductionsTotal });
    assert(result.netTotal === 36500, 'Net total equals 36,500 (Gross - Deductions)', { net: result.netTotal });
  }

  // TEST 3: Mathjs Expressions with Complex Conditions
  {
    const rules: SalaryRuleComputationInput[] = [
      {
        code: 'BASE',
        name: 'Base',
        category: 'BASIC',
        sequence: 1,
        computeMethod: 'FIXED',
        amount: 100000,
      },
      {
        code: 'BONUS',
        name: 'Performance Bonus',
        category: 'ALLOWANCE',
        sequence: 2,
        computeMethod: 'FORMULA',
        formula: 'BASE > 50000 ? 15000 : 5000',
      },
      {
        code: 'TAX',
        name: 'TDS Tax',
        category: 'DEDUCTION',
        sequence: 3,
        computeMethod: 'FORMULA',
        formula: '(BASE + BONUS) * 0.15', // (100,000 + 15,000) * 0.15 = 17,250
      },
    ];

    const context: EmployeeSalaryContext = {
      contractWage: 100000,
      workedDays: 30,
    };

    const result = salaryEngineService.compute(context, rules);

    assert(result.context['BONUS'] === 15000, 'Ternary formula evaluated BONUS = 15,000', result.context);
    assert(result.context['TAX'] === 17250, 'Tax correctly evaluated to 17,250', result.context);
    assert(result.netTotal === 97750, 'Net salary is 97,750 (115,000 - 17,250)', { net: result.netTotal });
  }

  console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL SALARY ENGINE TESTS PASSED PERFECTLY!\n');
  } else {
    process.exit(1);
  }
}

// Execute tests
runSalaryEngineTests();