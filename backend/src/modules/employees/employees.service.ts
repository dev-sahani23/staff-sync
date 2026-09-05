import prisma from '../../prisma/index.js';
import { EmployeeStatus } from '@prisma/client';

export class EmployeesService {
  async createEmployee(data: any) {
    return prisma.employee.create({ data });
  }

  async getEmployees(filters: any) {
    const { department, status, search, view } = filters;

    const where: any = {};
    if (department) where.department = department;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        manager: true,
        schedule: true,
      }
    });

    if (view === 'kanban') {
      // Logic to format for kanban (e.g. group by department or status)
      // We can just return the flat list and let frontend handle grouping, or group here.
      // Returning flat list for now.
      return employees;
    }

    return employees;
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { manager: true, schedule: true }
    });
    if (!employee) throw new Error('Employee not found');
    return employee;
  }

  async updateEmployee(id: string, data: any) {
    return prisma.employee.update({
      where: { id },
      data
    });
  }

  async getEmployeeContracts(employeeId: string) {
    return prisma.contract.findMany({ where: { employeeId } });
  }

  async getEmployeeAttendance(employeeId: string) {
    return prisma.attendance.findMany({ where: { employeeId } });
  }

  async getEmployeeTimeOffRequests(employeeId: string) {
    return prisma.leaveRequest.findMany({ where: { employeeId } });
  }

  async getEmployeeAllocations(employeeId: string) {
    return prisma.leaveAllocation.findMany({ where: { employeeId } });
  }
}
