import prisma from '../../prisma/index.ts';
import { payslipPdfService } from './payslip-pdf.service.ts';
import type { PayslipTemplateData } from './payslip-template.ts';

export class PayslipsService {
  /**
   * Get single payslip with employee, contract, and lines.
   */
  async getPayslipById(id: string) {
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: true,
        contract: true,
        payrun: {
          include: { salaryStructure: true },
        },
        lines: {
          include: { salaryRule: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!payslip) {
      throw new Error(`Payslip with ID '${id}' not found`);
    }

    // Compute totals
    let gross = 0;
    let deductions = 0;
    let net = 0;

    for (const line of payslip.lines) {
      const cat = line.salaryRule?.category;
      if (cat === 'BASIC' || cat === 'ALLOWANCE' || cat === 'GROSS') {
        gross += line.amount;
      } else if (cat === 'DEDUCTION') {
        deductions += line.amount;
      } else if (cat === 'NET' || line.label.toUpperCase() === 'NET') {
        net = line.amount;
      }
    }

    if (net === 0) net = gross - deductions;

    return {
      ...payslip,
      grossTotal: Math.round(gross * 100) / 100,
      deductionsTotal: Math.round(deductions * 100) / 100,
      netTotal: Math.round(net * 100) / 100,
    };
  }

  /**
   * Get payslips for a specific employee (Self-service).
   */
  async getMyPayslips(employeeId: string) {
    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId,
        payrun: {
          status: { in: ['VALIDATED', 'PAID'] },
        },
      },
      include: {
        payrun: true,
        lines: {
          include: { salaryRule: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payslips.map((ps: any) => {
      let gross = 0;
      let deductions = 0;
      let net = 0;

      for (const line of ps.lines) {
        const cat = line.salaryRule?.category;
        if (cat === 'BASIC' || cat === 'ALLOWANCE' || cat === 'GROSS') {
          gross += line.amount;
        } else if (cat === 'DEDUCTION') {
          deductions += line.amount;
        } else if (cat === 'NET' || line.label.toUpperCase() === 'NET') {
          net = line.amount;
        }
      }

      if (net === 0) net = gross - deductions;

      return {
        id: ps.id,
        payrunName: ps.payrun.name,
        periodStart: ps.payrun.periodStart,
        periodEnd: ps.payrun.periodEnd,
        status: ps.payrun.status,
        workedDays: ps.workedDays,
        grossTotal: Math.round(gross * 100) / 100,
        netTotal: Math.round(net * 100) / 100,
      };
    });
  }

  /**
   * Generate PDF Buffer for a payslip.
   */
  async generatePdf(payslipId: string): Promise<{ buffer: Buffer; employeeName: string }> {
    const ps = await this.getPayslipById(payslipId);

    const templateData: PayslipTemplateData = {
      companyName: 'PeoplePay360 Inc.',
      payslipId: ps.id,
      payrunName: ps.payrun.name,
      periodStart: ps.payrun.periodStart.toISOString(),
      periodEnd: ps.payrun.periodEnd.toISOString(),
      employee: {
        id: ps.employee.id,
        fullName: `${ps.employee.firstName} ${ps.employee.lastName}`,
        email: ps.employee.email,
        department: ps.employee.department,
        jobPosition: ps.employee.jobPosition,
        bankName: ps.employee.bankName,
        accountNumber: ps.employee.accountNumber,
      },
      contractWage: ps.contract?.wage || 0,
      workedDays: ps.workedDays,
      totalWorkingDays: 30,
      grossTotal: ps.grossTotal,
      deductionsTotal: ps.deductionsTotal,
      netTotal: ps.netTotal,
      lines: ps.lines.map((l: any) => ({
        code: l.salaryRule?.code || 'RULE',
        label: l.label,
        category: l.salaryRule?.category || 'ALLOWANCE',
        amount: l.amount,
      })),
    };

    const buffer = await payslipPdfService.generatePdfBuffer(templateData);
    return {
      buffer,
      employeeName: `${ps.employee.firstName}_${ps.employee.lastName}`,
    };
  }
}

export const payslipsService = new PayslipsService();
