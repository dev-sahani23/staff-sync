import { Request, Response } from 'express';
import { SchedulesService } from './schedules.service';

const schedulesService = new SchedulesService();

export class SchedulesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await schedulesService.createSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const schedules = await schedulesService.getSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await schedulesService.getScheduleById(req.params.id);
      res.json(schedule);
    } catch (error: any) {
      res.status(404).json({ statusCode: 404, message: error.message, error: 'Not Found' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await schedulesService.updateSchedule(req.params.id, req.body);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await schedulesService.deleteSchedule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }
}
