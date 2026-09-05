import type { Request, Response } from 'express';
import { EmployeesService } from './employees.service.js';

const employeesService = new EmployeesService();

export class EmployeesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const employee = await employeesService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const employees = await employeesService.getEmployees(req.query);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const employee = await employeesService.getEmployeeById(req.params.id as string);
      res.json(employee);
    } catch (error: any) {
      res.status(404).json({ statusCode: 404, message: error.message, error: 'Not Found' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const employee = await employeesService.updateEmployee(req.params.id as string, req.body);
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
