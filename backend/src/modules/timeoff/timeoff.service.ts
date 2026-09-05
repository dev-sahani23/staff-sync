import prisma from '../../prisma/index.js';
import { LeaveRequestStatus } from '@prisma/client';

export class TimeOffService {
  // Types
  async createType(data: any) {
    return prisma.timeOffType.create({ data });
  }

  async getTypes() {
    return prisma.timeOffType.findMany();
  }

  // Allocations
  async createAllocation(data: any) {
    return prisma.leaveAllocation.create({ data });
  }

  async getAllocations() {
    return prisma.leaveAllocation.findMany({
      include: { employee: true, timeOffType: true }
    });
  }

  // Requests
  async createRequest(data: any) {
    if (!data.employeeId || typeof data.employeeId !== 'string' || data.employeeId.trim() === '') {
      throw new Error('A valid Employee is required for submitting a leave request.');
    }
    if (!data.timeOffTypeId || typeof data.timeOffTypeId !== 'string' || data.timeOffTypeId.trim() === '') {
      throw new Error('A valid Leave Type is required for submitting a leave request.');
    }

    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new Error(`Employee with ID '${data.employeeId}' does not exist.`);
    }

    const timeOffType = await prisma.timeOffType.findUnique({
      where: { id: data.timeOffTypeId },
    });
    if (!timeOffType) {
      throw new Error(`Leave Type with ID '${data.timeOffTypeId}' does not exist.`);
    }

    return prisma.leaveRequest.create({
      data: {
        employeeId: data.employeeId,
        timeOffTypeId: data.timeOffTypeId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: Number(data.duration) || 1,
        notes: data.notes || null,
        status: data.status || 'PENDING',
      },
    });
  }

  async getRequests() {
    return prisma.leaveRequest.findMany({
      include: { employee: true, timeOffType: true }
    });
  }

  async approveRequest(id: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.findUnique({ where: { id }, include: { timeOffType: true } });
      if (!request) throw new Error('Request not found');
      if (request.status === LeaveRequestStatus.APPROVED) throw new Error('Already approved');

      // Update status
      const updatedReq = await tx.leaveRequest.update({
        where: { id },
        data: { status: LeaveRequestStatus.APPROVED }
      });

      if (request.timeOffType.requiresAllocation) {
        // Find allocation
        const allocation = await tx.leaveAllocation.findFirst({
          where: {
            employeeId: request.employeeId,
            timeOffTypeId: request.timeOffTypeId
          }
        });

        if (!allocation) {
          throw new Error('No allocation found for this leave type');
        }

        if (allocation.taken + request.duration > allocation.allocated) {
          throw new Error('Leave duration exceeds available allocation');
        }

        await tx.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            taken: allocation.taken + request.duration
          }
        });
      }

      return updatedReq;
    });
  }

  async refuseRequest(id: string) {
    return prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.REFUSED }
    });
  }
}
