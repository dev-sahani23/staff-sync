import type { Request, Response } from 'express';
import { AttendanceService } from './attendance.service.js';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

const attendanceService = new AttendanceService();

export class AttendanceController {
  async checkIn(req: AuthRequest, res: Response): Promise<void> {
    try {
      // By default, check in self. If HR, they can check in someone else by passing employeeId
      const employeeId = req.body.employeeId || req.user?.employeeId;
      if (!employeeId) {
        res.status(400).json({ statusCode: 400, message: 'Employee ID is required', error: 'Bad Request' });
        return;
      }
      
      const record = await attendanceService.checkIn(employeeId);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const record = await attendanceService.checkOut(req.params.id as string);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await attendanceService.getAttendance(req.query);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async correct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const correctedBy = req.user?.userId || 'SYSTEM';
      const record = await attendanceService.correctAttendance(req.params.id as string, req.body, correctedBy);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }
}
