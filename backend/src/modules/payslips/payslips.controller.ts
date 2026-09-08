import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.ts';
import { payslipsService } from './payslips.service.ts';

export class PayslipsController {
  async getPayslipById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const payslip = await payslipsService.getPayslipById(id);

      // If user is Employee, ensure they only view their own payslip
      if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== payslip.employeeId) {
        res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You can only view your own payslips',
          error: 'Forbidden',
        });
        return;
      }

      res.status(200).json({
        statusCode: 200,
        data: payslip,
      });
    } catch (error: any) {
      res.status(404).json({
        statusCode: 404,
        message: error.message || 'Payslip not found',
        error: 'Not Found',
      });
    }
  }

  async getMyPayslips(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        res.status(400).json({
          statusCode: 400,
          message: 'Employee profile not associated with this account',
          error: 'Bad Request',
        });
        return;
      }

      const payslips = await payslipsService.getMyPayslips(employeeId);
      res.status(200).json({
        statusCode: 200,
        data: payslips,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch payslips',
        error: 'Internal Server Error',
      });
    }
  }

  async getAllPayslips(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { payrunId, employeeId } = req.query;

      const targetEmployeeId =
        req.user?.role === 'EMPLOYEE'
          ? req.user.employeeId ?? undefined
          : (employeeId as string | undefined);

      const payslips = await payslipsService.getAllPayslips({
        payrunId: payrunId as string | undefined,
        employeeId: targetEmployeeId,
      });

      res.status(200).json({
        statusCode: 200,
        data: payslips,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch payslips',
        error: 'Internal Server Error',
      });
    }
  }

  async downloadPdf(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const payslip = await payslipsService.getPayslipById(id);

      // Employee role check
      if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== payslip.employeeId) {
        res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You can only download your own payslip',
          error: 'Forbidden',
        });
        return;
      }

      const { buffer, employeeName } = await payslipsService.generatePdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="Payslip_${employeeName}_${id.substring(0, 8)}.pdf"`
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(200).send(buffer);
    } catch (error: any) {
      console.error('[Payslip PDF Error]:', error);
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to generate payslip PDF',
        error: 'Bad Request',
      });
    }
  }
}

export const payslipsController = new PayslipsController();
