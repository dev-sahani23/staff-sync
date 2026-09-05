import type { Request, Response } from 'express';
import { payrunsService } from './payruns.service.ts';
import {
  PayrunDraftScopeSchema,
  CreatePayrunSchema,
  PayrunQueryFilterSchema,
} from './payruns.schema.ts';

export class PayrunsController {
  // --- WIZARD STEP 1: PREVIEW DRAFT SCOPE ---
  async previewDraftScope(req: Request, res: Response): Promise<void> {
    try {
      const parsed = PayrunDraftScopeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const preview = await payrunsService.previewDraftScope(parsed.data);
      res.status(200).json({
        statusCode: 200,
        message: 'Draft payrun scope preview generated',
        data: preview,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to generate draft preview',
        error: 'Bad Request',
      });
    }
  }

  // --- WIZARD STEP 2: CREATE PAYRUN BATCH ---
  async createPayrun(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreatePayrunSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const payrun = await payrunsService.createPayrun(parsed.data);
      res.status(201).json({
        statusCode: 201,
        message: 'Payrun created successfully in DRAFT status',
        data: payrun,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to create payrun',
        error: 'Bad Request',
      });
    }
  }

  // --- LIST PAYRUNS ---
  async getAllPayruns(req: Request, res: Response): Promise<void> {
    try {
      const parsed = PayrunQueryFilterSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : undefined;
      const payruns = await payrunsService.getAllPayruns(filters);
      res.status(200).json({
        statusCode: 200,
        data: payruns,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch payruns',
        error: 'Internal Server Error',
      });
    }
  }

  // --- GET PAYRUN DETAIL ---
  async getPayrunById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const payrun = await payrunsService.getPayrunById(id);
      res.status(200).json({
        statusCode: 200,
        data: payrun,
      });
    } catch (error: any) {
      res.status(404).json({
        statusCode: 404,
        message: error.message || 'Payrun not found',
        error: 'Not Found',
      });
    }
  }

  // --- STEP 3: COMPUTE BATCH ---
  async computePayrun(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const computedPayrun = await payrunsService.computePayrun(id);
      res.status(200).json({
        statusCode: 200,
        message: 'Payrun batch computed successfully',
        data: computedPayrun,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to compute payrun',
        error: 'Bad Request',
      });
    }
  }

  // --- STEP 4a: VALIDATE ---
  async validatePayrun(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedPayrun = await payrunsService.validatePayrun(id);
      res.status(200).json({
        statusCode: 200,
        message: 'Payrun validated successfully',
        data: validatedPayrun,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to validate payrun',
        error: 'Bad Request',
      });
    }
  }

  // --- STEP 4b: MARK PAID ---
  async markPaid(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const paidPayrun = await payrunsService.markPaid(id);
      res.status(200).json({
        statusCode: 200,
        message: 'Payrun marked as PAID. Payslips are now locked.',
        data: paidPayrun,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to mark payrun as paid',
        error: 'Bad Request',
      });
    }
  }

  // --- STEP 5: SEND PAYSLIPS EMAIL DISPATCH ---
  async sendPayrunPayslips(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const payrun = await payrunsService.getPayrunById(id);

      // Trigger asynchronous background dispatch without blocking response (returns 202 Accepted)
      import('../mail/mail.service.ts').then(({ mailService }) => {
        mailService.dispatchPayrunEmails(id).catch((err: any) => {
          console.error(`Background email dispatch error for payrun ${id}:`, err.message);
        });
      });

      res.status(202).json({
        statusCode: 202,
        message: 'Payslip email dispatch initiated in background',
        data: {
          payrunId: id,
          payrunName: payrun.name,
          totalEmployees: payrun.totalEmployees,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to dispatch payslips',
        error: 'Bad Request',
      });
    }
  }

  // --- DELETE PAYRUN ---
  async deletePayrun(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await payrunsService.deletePayrun(id);
      res.status(200).json({
        statusCode: 200,
        message: 'Payrun deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to delete payrun',
        error: 'Bad Request',
      });
    }
  }
}

export const payrunsController = new PayrunsController();
