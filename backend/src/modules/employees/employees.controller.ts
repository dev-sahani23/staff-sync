import type { Response } from 'express';
import { EmployeesService } from './employees.service.js';
import prisma from '../../prisma/index.js';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

const employeesService = new EmployeesService();

export class EmployeesController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employee = await employeesService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employees = await employeesService.getEmployees(req.query);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employee = await employeesService.getEmployeeById(req.params.id as string);
      res.json(employee);
    } catch (error: any) {
      res.status(404).json({ statusCode: 404, message: error.message, error: 'Not Found' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = req.params.id as string;
      const user = req.user;

      // 1. Prevent user from modifying their own employee record by employeeId
      if (user?.employeeId && user.employeeId === targetId) {
        res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You cannot modify your own employee credentials or profile information.',
          error: 'Forbidden',
        });
        return;
      }

      // 2. Also check if target employee email matches the authenticated user's email
      const targetEmp = await employeesService.getEmployeeById(targetId);
      if (targetEmp && user?.userId) {
        const currentUser = await prisma.user.findUnique({ where: { id: user.userId } });
        if (currentUser && currentUser.email.toLowerCase() === targetEmp.email.toLowerCase()) {
          res.status(403).json({
            statusCode: 403,
            message: 'Forbidden: You cannot modify your own employee credentials or profile information.',
            error: 'Forbidden',
          });
          return;
        }
      }

      const employee = await employeesService.updateEmployee(targetId, req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getContracts(req: Request, res: Response): Promise<void> {
    try {
      const contracts = await employeesService.getEmployeeContracts(req.params.id as string);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getAttendance(req: Request, res: Response): Promise<void> {
    try {
      const attendance = await employeesService.getEmployeeAttendance(req.params.id as string);
      res.json(attendance);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getTimeOff(req: Request, res: Response): Promise<void> {
    try {
      const timeoff = await employeesService.getEmployeeTimeOffRequests(req.params.id as string);
      res.json(timeoff);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await employeesService.getEmployeeAllocations(req.params.id as string);
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }
}
