import prisma from '../../prisma/index.ts';
import type { DashboardFilterInput } from './dashboard.schema.ts';

export class DashboardService {
  /**
   * Top-level KPI metric cards.
   */
  async getKpis(filters?: DashboardFilterInput) {
    const deptFilter = filters?.department;

    // 1. Employee Count
    const totalActiveEmployees = await prisma.employee.count({
      where: {
        status: 'ACTIVE',
        ...(deptFilter && { department: deptFilter }),
      },
    });

    // 2. Fetch Payslips
    const payslips = await prisma.payslip.findMany({
      where: {
        ...(deptFilter && { employee: { department: deptFilter } }),
      },
      include: {
        lines: { include: { salaryRule: true } },
        payrun: true,
      },
    });

    let totalNetPaid = 0;
    let totalGrossAll = 0;

    for (const ps of payslips) {
      let gross = 0;
      let deductions = 0;
      let net = 0;

      for (const line of ps.lines) {
        const cat = line.salaryRule?.category;
        if (cat === 'BASIC' || cat === 'ALLOWANCE' || cat === 'GROSS') gross += line.amount;
        else if (cat === 'DEDUCTION') deductions += line.amount;
        else if (cat === 'NET' || line.label.toUpperCase() === 'NET') net = line.amount;
      }

      if (net === 0) net = gross - deductions;

      totalGrossAll += gross;
      if (ps.payrun.status === 'PAID') {
        totalNetPaid += net;
      }
    }

    const averageSalary =
      payslips.length > 0 ? Math.round((totalGrossAll / payslips.length) * 100) / 100 : 0;

    // 3. Approved Time Off Days
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        ...(deptFilter && { employee: { department: deptFilter } }),
      },
    });
    const totalApprovedTimeOffDays = leaveRequests.reduce(
      (acc: number, l: any) => acc + (l.duration || 0),
      0
    );

    // 4. Attendance Health
    const totalAttendanceCount = await prisma.attendance.count({
      where: {
        ...(deptFilter && { employee: { department: deptFilter } }),
      },
    });
    const presentCount = await prisma.attendance.count({
      where: {
        status: { in: ['PRESENT', 'CORRECTED'] },
        ...(deptFilter && { employee: { department: deptFilter } }),
      },
    });

    const attendanceHealth =
      totalAttendanceCount > 0
        ? Math.round((presentCount / totalAttendanceCount) * 1000) / 10
        : 100;

    return {
      totalNetSalaryPaid: Math.round(totalNetPaid * 100) / 100,
      totalPayslipsGenerated: payslips.length,
      averageSalary,
      activeEmployees: totalActiveEmployees,
      approvedTimeOffDays: totalApprovedTimeOffDays,
      attendanceHealthPercentage: attendanceHealth,
    };
  }

  /**
   * Aggregates total salary cost grouped by Department.
   */
  async getSalaryCostByDepartment(filters?: DashboardFilterInput) {
    const payslips = await prisma.payslip.findMany({
      include: {
        employee: { select: { department: true } },
        lines: { include: { salaryRule: true } },
      },
    });

    const deptMap: Record<string, { employeeIds: Set<string>; totalGross: number; totalNet: number }> = {};

    for (const ps of payslips) {
      const dept = ps.employee.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { employeeIds: new Set(), totalGross: 0, totalNet: 0 };
      }

      deptMap[dept].employeeIds.add(ps.employeeId);

      let gross = 0;
      let deductions = 0;
      let net = 0;

      for (const line of ps.lines) {
        const cat = line.salaryRule?.category;
        if (cat === 'BASIC' || cat === 'ALLOWANCE' || cat === 'GROSS') gross += line.amount;
        else if (cat === 'DEDUCTION') deductions += line.amount;
        else if (cat === 'NET' || line.label.toUpperCase() === 'NET') net = line.amount;
      }

      if (net === 0) net = gross - deductions;

      deptMap[dept].totalGross += gross;
      deptMap[dept].totalNet += net;
    }

    return Object.entries(deptMap).map(([department, data]) => ({
      department,
      employeeCount: data.employeeIds.size,
      totalGross: Math.round(data.totalGross * 100) / 100,
      totalNet: Math.round(data.totalNet * 100) / 100,
    }));
  }

  /**
   * Monthly historical trend of salary payments.
   */
  async getMonthlyNetTrend(_filters?: DashboardFilterInput) {
    const payruns = await prisma.payrun.findMany({
      include: {
        payslips: {
          include: { lines: { include: { salaryRule: true } } },
        },
      },
      orderBy: { periodStart: 'asc' },
    });

    const monthlyMap: Record<string, { gross: number; net: number; count: number }> = {};

    for (const pr of payruns) {
      const monthKey = pr.periodStart.toISOString().substring(0, 7); // "YYYY-MM"
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { gross: 0, net: 0, count: 0 };
      }

      for (const ps of pr.payslips) {
        let gross = 0;
        let deductions = 0;
        let net = 0;

        for (const line of ps.lines) {
          const cat = line.salaryRule?.category;
          if (cat === 'BASIC' || cat === 'ALLOWANCE' || cat === 'GROSS') gross += line.amount;
          else if (cat === 'DEDUCTION') deductions += line.amount;
          else if (cat === 'NET' || line.label.toUpperCase() === 'NET') net = line.amount;
        }

        if (net === 0) net = gross - deductions;

        monthlyMap[monthKey].gross += gross;
        monthlyMap[monthKey].net += net;
        monthlyMap[monthKey].count += 1;
      }
    }

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      totalGross: Math.round(data.gross * 100) / 100,
      totalNet: Math.round(data.net * 100) / 100,
      payslipsCount: data.count,
    }));
  }

  /**
   * Attendance Overview Summary.
   */
  async getAttendanceOverview(filters?: DashboardFilterInput) {
    const deptFilter = filters?.department;

    const [present, late, absent, exceptions, corrected] = await Promise.all([
      prisma.attendance.count({
        where: { status: 'PRESENT', ...(deptFilter && { employee: { department: deptFilter } }) },
      }),
      prisma.attendance.count({
        where: { status: 'LATE', ...(deptFilter && { employee: { department: deptFilter } }) },
      }),
      prisma.attendance.count({
        where: { status: 'ABSENT', ...(deptFilter && { employee: { department: deptFilter } }) },
      }),
      prisma.attendance.count({
        where: { status: 'EXCEPTION', ...(deptFilter && { employee: { department: deptFilter } }) },
      }),
      prisma.attendance.count({
        where: { status: 'CORRECTED', ...(deptFilter && { employee: { department: deptFilter } }) },
      }),
    ]);

    return {
      present,
      late,
      absent,
      exceptions,
      corrected,
      total: present + late + absent + exceptions + corrected,
    };
  }

  /**
   * Operational Alerts & Warnings.
   */
  async getAlerts(_filters?: DashboardFilterInput) {
    // 1. Payslips with warnings
    const payslipsWithWarnings = await prisma.payslip.findMany({
      where: {
        warnings: { not: null },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true } },
        payrun: { select: { id: true, name: true, status: true } },
      },
      take: 20,
    });

    // 2. Contracts expiring in next 30 days
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const expiringContracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: in30Days },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true } },
      },
      take: 20,
    });

    return {
      payrollWarnings: payslipsWithWarnings.map((ps: any) => ({
        payslipId: ps.id,
        payrunName: ps.payrun.name,
        employeeName: `${ps.employee.firstName} ${ps.employee.lastName}`,
        department: ps.employee.department,
        warnings: ps.warnings ? ps.warnings.split(', ') : [],
      })),
      expiringContracts: expiringContracts.map((c: any) => ({
        contractId: c.id,
        employeeName: `${c.employee.firstName} ${c.employee.lastName}`,
        department: c.employee.department,
        endDate: c.endDate,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
