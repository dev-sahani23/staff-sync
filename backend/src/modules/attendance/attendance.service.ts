import prisma from '../../prisma';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
  async checkIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // See if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today
      }
    });

    if (existing) {
      throw new Error('Already checked in today');
    }

    return prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT
      }
    });
  }

  async checkOut(id: string) {
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new Error('Attendance record not found');
    if (!attendance.checkIn) throw new Error('Cannot check out without checking in');
    if (attendance.checkOut) throw new Error('Already checked out');

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - attendance.checkIn.getTime();
    const workedHours = diffMs / (1000 * 60 * 60);

    return prisma.attendance.update({
      where: { id },
      data: {
        checkOut: checkOutTime,
        workedHours
      }
    });
  }

  async getAttendance(filters: any) {
    const { employeeId, status, startDate, endDate } = filters;
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return prisma.attendance.findMany({ where });
  }

  async correctAttendance(id: string, data: any, correctedBy: string) {
    let workedHours = data.workedHours;
    if (data.checkIn && data.checkOut && !workedHours) {
      const cIn = new Date(data.checkIn);
      const cOut = new Date(data.checkOut);
      workedHours = (cOut.getTime() - cIn.getTime()) / (1000 * 60 * 60);
    }

    return prisma.attendance.update({
      where: { id },
      data: {
        ...data,
        workedHours,
        status: AttendanceStatus.CORRECTED,
        correctedBy
      }
    });
  }

  // To be run by a nightly cron job
  async flagExceptions() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    return prisma.attendance.updateMany({
      where: {
        checkOut: null,
        date: { lte: yesterday },
        status: { not: AttendanceStatus.EXCEPTION }
      },
      data: {
        status: AttendanceStatus.EXCEPTION
      }
    });
  }
}
