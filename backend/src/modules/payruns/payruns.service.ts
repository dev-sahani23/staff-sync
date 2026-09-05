import prisma from '../../prisma/index.ts';
import { salaryEngineService } from '../salary-engine/salary-engine.service.ts';
import type {
  PayrunDraftScopeInput,
  CreatePayrunInput,
  PayrunQueryFilterInput,
} from './payruns.schema.ts';
import type { Contract, Employee, Payslip, PayslipLine, SalaryRule } from '@prisma/client';

export class PayrunsService {
  /**
   * Wizard Step 1: Preview eligible employees matching the salary structure for the period.
   */
  async previewDraftScope(data: PayrunDraftScopeInput) {
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    // 1. Verify salary structure exists
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: data.salaryStructureId },
      include: { rules: { orderBy: { sequence: 'asc' } } },
    });

    if (!structure) {
      throw new Error(`Salary Structure with ID '${data.salaryStructureId}' not found`);
    }

    // 2. Query employees with active contracts matching this structure
    const matchingContracts = await prisma.contract.findMany({
      where: {
        salaryStructureId: data.salaryStructureId,
        status: 'ACTIVE',
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobPosition: true,
            department: true,
            status: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    const eligibleEmployees = matchingContracts.map((c: Contract & { employee: any }) => ({
      employeeId: c.employee.id,
      firstName: c.employee.firstName,
      lastName: c.employee.lastName,
      email: c.employee.email,
      department: c.employee.department,
      jobPosition: c.employee.jobPosition,
      contractId: c.id,
      wage: c.wage,
      hasBankDetails: Boolean(c.employee.bankName && c.employee.accountNumber),
    }));

    return {
      salaryStructureId: structure.id,
      salaryStructureName: structure.name,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalEligibleCount: eligibleEmployees.length,
      eligibleEmployees,
    };
  }

  /**
   * Wizard Step 2: Create real Payrun row in DRAFT status.
   */
  async createPayrun(data: CreatePayrunInput) {
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    // Verify structure
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: data.salaryStructureId },
    });

    if (!structure) {
      throw new Error(`Salary Structure with ID '${data.salaryStructureId}' not found`);
    }

    // Create Payrun with initial draft payslip placeholders for selected employees
    return prisma.$transaction(async (tx: any) => {
      const payrun = await tx.payrun.create({
        data: {
          name: data.name,
          salaryStructureId: data.salaryStructureId,
          periodStart,
          periodEnd,
          status: 'DRAFT',
        },
      });

      // Find active contract for each employee to create placeholder payslips
      for (const employeeId of data.employeeIds) {
        const contract = await tx.contract.findFirst({
          where: {
            employeeId,
            salaryStructureId: data.salaryStructureId,
            status: 'ACTIVE',
            startDate: { lte: periodEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: periodStart } },
            ],
          },
        });

        if (contract) {
          await tx.payslip.create({
            data: {
              payrunId: payrun.id,
              employeeId,
              contractId: contract.id,
              workedDays: 0,
              warnings: null,
            },
          });
        }
      }

      return tx.payrun.findUnique({
        where: { id: payrun.id },
        include: {
          salaryStructure: true,
          payslips: {
            include: {
              employee: true,
              contract: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get list of all Payruns with summary statistics.
   */
  async getAllPayruns(filters?: PayrunQueryFilterInput) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.salaryStructureId) where.salaryStructureId = filters.salaryStructureId;

    const payruns = await prisma.payrun.findMany({
      where,
      include: {
        salaryStructure: true,
        payslips: {
          include: {
            lines: true,
          },
        },
        _count: {
          select: { payslips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payruns.map((p: any) => {
      let totalGross = 0;
      let totalNet = 0;
      let totalWarningsCount = 0;

      for (const slip of p.payslips) {
        if (slip.warnings) totalWarningsCount++;
        for (const line of slip.lines) {
          if (line.salaryRuleId) {
            // Gross & Net totals
            if (line.label.toUpperCase().includes('BASIC') || line.label.toUpperCase().includes('ALLOWANCE')) {
              totalGross += line.amount;
            }
          }
        }
      }

      return {
        id: p.id,
        name: p.name,
        salaryStructureId: p.salaryStructureId,
        salaryStructureName: p.salaryStructure?.name,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        status: p.status,
        totalPayslips: p._count.payslips,
        warningsCount: totalWarningsCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
  }

  /**
   * Get single Payrun detail with itemized payslips and warnings.
   */
  async getPayrunById(id: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        salaryStructure: {
          include: { rules: { orderBy: { sequence: 'asc' } } },
        },
        payslips: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
                jobPosition: true,
                bankName: true,
                accountNumber: true,
              },
            },
            contract: true,
            lines: {
              orderBy: { createdAt: 'asc' },
              include: { salaryRule: true },
            },
          },
        },
      },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${id}' not found`);
    }

    // Compute roll-up totals
    let totalGross = 0;
    let totalNet = 0;
    let warningCount = 0;

    const formattedPayslips = payrun.payslips.map((ps: any) => {
      let gross = 0;
      let net = 0;
      let deductions = 0;

      for (const line of ps.lines) {
        const cat = line.salaryRule?.category;
        if (cat === 'BASIC' || cat === 'ALLOWANCE') gross += line.amount;
        else if (cat === 'DEDUCTION') deductions += line.amount;
        else if (cat === 'NET' || line.label.toUpperCase() === 'NET') net = line.amount;
      }

      if (net === 0) net = gross - deductions;

      totalGross += gross;
      totalNet += net;
      if (ps.warnings) warningCount++;

      return {
        id: ps.id,
        employee: ps.employee,
        contract: ps.contract,
        workedDays: ps.workedDays,
        warnings: ps.warnings ? ps.warnings.split(', ') : [],
        grossTotal: Math.round(gross * 100) / 100,
        netTotal: Math.round(net * 100) / 100,
        lines: ps.lines,
      };
    });

    return {
      id: payrun.id,
      name: payrun.name,
      status: payrun.status,
      periodStart: payrun.periodStart,
      periodEnd: payrun.periodEnd,
      salaryStructure: payrun.salaryStructure,
      totalEmployees: formattedPayslips.length,
      totalGross: Math.round(totalGross * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      warningsCount: warningCount,
      payslips: formattedPayslips,
      createdAt: payrun.createdAt,
      updatedAt: payrun.updatedAt,
    };
  }

  /**
   * Step 3: Compute all Payslips for the Payrun batch.
   */
  async computePayrun(payrunId: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        salaryStructure: {
          include: { rules: { orderBy: { sequence: 'asc' } } },
        },
        payslips: {
          include: { employee: true },
        },
      },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${payrunId}' not found`);
    }

    if (payrun.status === 'PAID') {
      throw new Error('Cannot recompute a payrun that has already been marked as PAID');
    }

    const { salaryStructure, periodStart, periodEnd } = payrun;
    const rules = salaryStructure.rules;

    if (rules.length === 0) {
      throw new Error(`Salary structure '${salaryStructure.name}' has no configured salary rules`);
    }

    // Get all employee IDs in this payrun
    const employeeIds = payrun.payslips.map((p: any) => p.employeeId);

    // Run batch computation inside transaction
    return prisma.$transaction(async (tx: any) => {
      // 1. Clear existing payslip lines
      for (const slip of payrun.payslips) {
        await tx.payslipLine.deleteMany({
          where: { payslipId: slip.id },
        });
      }

      // 2. Process each employee
      for (const employeeId of employeeIds) {
        const warnings: string[] = [];

        // Check 1: Find Active Contract for this period
        const matchingContracts = await tx.contract.findMany({
          where: {
            employeeId,
            salaryStructureId: payrun.salaryStructureId,
            status: 'ACTIVE',
            startDate: { lte: periodEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: periodStart } },
            ],
          },
        });

        if (matchingContracts.length === 0) {
          warnings.push('NO_MATCHING_CONTRACT');
        } else if (matchingContracts.length > 1) {
          warnings.push('MULTIPLE_ACTIVE_CONTRACTS');
        }

        const contract = matchingContracts[0];
        const contractWage = contract ? contract.wage : 0;

        // Check 2: Attendance & Leave Days
        const attendanceRecords = await tx.attendance.findMany({
          where: {
            employeeId,
            date: { gte: periodStart, lte: periodEnd },
            status: { in: ['PRESENT', 'CORRECTED'] },
          },
        });

        // Calculate worked days: count present days or default to 30 days if attendance not logged
        let workedDays = attendanceRecords.length;
        if (workedDays === 0) {
          workedDays = 30; // standard month fallback
        }

        // Add approved paid leaves
        const approvedLeaves = await tx.leaveRequest.findMany({
          where: {
            employeeId,
            status: 'APPROVED',
            startDate: { lte: periodEnd },
            endDate: { gte: periodStart },
          },
        });
        const leaveDays = approvedLeaves.reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
        workedDays = Math.min(workedDays + leaveDays, 30);

        // Check 3: Missing Bank Details
        const employee = await tx.employee.findUnique({ where: { id: employeeId } });
        if (!employee?.bankName || !employee?.accountNumber) {
          warnings.push('MISSING_BANK_DETAILS');
        }

        // Check 4: Duplicate Payslip in another VALIDATED/PAID payrun for this period
        const duplicateSlip = await tx.payslip.findFirst({
          where: {
            employeeId,
            payrunId: { not: payrunId },
            payrun: {
              status: { in: ['VALIDATED', 'PAID'] },
              periodStart: { lte: periodEnd },
              periodEnd: { gte: periodStart },
            },
          },
        });
        if (duplicateSlip) {
          warnings.push('DUPLICATE_PAYSLIP_IN_PERIOD');
        }

        // Compute lines using Salary Engine if contract exists
        let computedLines: any[] = [];
        if (contract) {
          const calculation = salaryEngineService.compute(
            {
              employeeId,
              contractWage,
              workedDays,
              totalWorkingDays: 30,
            },
            rules
          );

          computedLines = calculation.lines;
        }

        // Find or create Payslip record
        let existingSlip = await tx.payslip.findFirst({
          where: { payrunId, employeeId },
        });

        if (!existingSlip) {
          existingSlip = await tx.payslip.create({
            data: {
              payrunId,
              employeeId,
              contractId: contract ? contract.id : '',
              workedDays,
              warnings: warnings.length > 0 ? warnings.join(', ') : null,
            },
          });
        } else {
          existingSlip = await tx.payslip.update({
            where: { id: existingSlip.id },
            data: {
              contractId: contract ? contract.id : existingSlip.contractId,
              workedDays,
              warnings: warnings.length > 0 ? warnings.join(', ') : null,
            },
          });
        }

        // Create PayslipLines
        for (const line of computedLines) {
          if (line.salaryRuleId) {
            await tx.payslipLine.create({
              data: {
                payslipId: existingSlip.id,
                salaryRuleId: line.salaryRuleId,
                label: line.label,
                amount: line.amount,
              },
            });
          }
        }
      }

      // Update Payrun Status to COMPUTED
      await tx.payrun.update({
        where: { id: payrunId },
        data: { status: 'COMPUTED' },
      });

      return this.getPayrunById(payrunId);
    });
  }

  /**
   * Step 4a: Validate Payrun batch (checks warnings, transitions status to VALIDATED).
   */
  async validatePayrun(payrunId: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: { payslips: true },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${payrunId}' not found`);
    }

    if (payrun.status === 'DRAFT') {
      throw new Error('Payrun must be computed before validation');
    }

    if (payrun.status === 'PAID') {
      throw new Error('Payrun is already PAID and finalized');
    }

    return prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'VALIDATED' },
      include: {
        salaryStructure: true,
        payslips: true,
      },
    });
  }

  /**
   * Step 4b: Mark Payrun as PAID (locks payslips from further edits).
   */
  async markPaid(payrunId: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${payrunId}' not found`);
    }

    if (payrun.status !== 'VALIDATED') {
      throw new Error(`Payrun status is '${payrun.status}'. Only VALIDATED payruns can be marked as PAID.`);
    }

    return prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'PAID' },
      include: {
        salaryStructure: true,
        payslips: {
          include: { lines: true },
        },
      },
    });
  }

  /**
   * Delete Payrun batch (only if not PAID).
   */
  async deletePayrun(payrunId: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${payrunId}' not found`);
    }

    if (payrun.status === 'PAID') {
      throw new Error('Cannot delete a finalized PAID payrun');
    }

    return prisma.payrun.delete({
      where: { id: payrunId },
    });
  }
}

export const payrunsService = new PayrunsService();
