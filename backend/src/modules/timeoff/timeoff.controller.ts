import type { Request, Response } from 'express';
import { TimeOffService } from './timeoff.service.js';

const timeOffService = new TimeOffService();

export class TimeOffController {
  async createType(req: Request, res: Response): Promise<void> {
    try {
      const type = await timeOffService.createType(req.body);
      res.status(201).json(type);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await timeOffService.getTypes();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async createAllocation(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await timeOffService.createAllocation(req.body);
      res.status(201).json(allocation);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await timeOffService.getAllocations();
      // compute remaining
      const withRemaining = allocations.map((a: any) => ({ ...a, remaining: a.allocated - a.taken }));
      res.json(withRemaining);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      // employeeId from token can be injected here for EMPLOYEE role if not provided
      const request = await timeOffService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getRequests(req: Request, res: Response): Promise<void> {
    try {
      const requests = await timeOffService.getRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async approve(req: Request, res: Response): Promise<void> {
    try {
      const request = await timeOffService.approveRequest(req.params.id as string);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async refuse(req: Request, res: Response): Promise<void> {
    try {
      const request = await timeOffService.refuseRequest(req.params.id as string);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }
}
