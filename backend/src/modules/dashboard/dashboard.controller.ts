import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service.ts';
import { DashboardFilterSchema } from './dashboard.schema.ts';

export class DashboardController {
  async getKpis(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DashboardFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const kpis = await dashboardService.getKpis(filters);

      res.status(200).json({
        statusCode: 200,
        data: kpis,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch dashboard KPIs',
        error: 'Internal Server Error',
      });
    }
  }

  async getSalaryCostByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DashboardFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const data = await dashboardService.getSalaryCostByDepartment(filters);

      res.status(200).json({
        statusCode: 200,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch salary cost by department',
        error: 'Internal Server Error',
      });
    }
  }

  async getMonthlyNetTrend(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DashboardFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const data = await dashboardService.getMonthlyNetTrend(filters);

      res.status(200).json({
        statusCode: 200,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch monthly trend',
        error: 'Internal Server Error',
      });
    }
  }

  async getAttendanceOverview(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DashboardFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const data = await dashboardService.getAttendanceOverview(filters);

      res.status(200).json({
        statusCode: 200,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch attendance overview',
        error: 'Internal Server Error',
      });
    }
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DashboardFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const data = await dashboardService.getAlerts(filters);

      res.status(200).json({
        statusCode: 200,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch dashboard alerts',
        error: 'Internal Server Error',
      });
    }
  }
}

export const dashboardController = new DashboardController();
