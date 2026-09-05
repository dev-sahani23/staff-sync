import type { Request, Response } from 'express';
import { salaryRulesService } from './salary-rules.service.ts';
import {
  CreateSalaryStructureSchema,
  UpdateSalaryStructureSchema,
  CreateSalaryRuleSchema,
  UpdateSalaryRuleSchema,
} from './salary-rules.schema.ts';

export class SalaryRulesController {
  // --- STRUCTURES ---

  async createStructure(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreateSalaryStructureSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const structure = await salaryRulesService.createStructure(parsed.data);
      res.status(201).json({
        statusCode: 201,
        message: 'Salary structure created successfully',
        data: structure,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to create salary structure',
        error: 'Bad Request',
      });
    }
  }

  async getAllStructures(_req: Request, res: Response): Promise<void> {
    try {
      const structures = await salaryRulesService.getAllStructures();
      res.status(200).json({
        statusCode: 200,
        data: structures,
      });
    } catch (error: any) {
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Failed to fetch salary structures',
        error: 'Internal Server Error',
      });
    }
  }

  async getStructureById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const structure = await salaryRulesService.getStructureById(id);
      res.status(200).json({
        statusCode: 200,
        data: structure,
      });
    } catch (error: any) {
      res.status(404).json({
        statusCode: 404,
        message: error.message || 'Salary structure not found',
        error: 'Not Found',
      });
    }
  }

  async updateStructure(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const parsed = UpdateSalaryStructureSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const updated = await salaryRulesService.updateStructure(id, parsed.data);
      res.status(200).json({
        statusCode: 200,
        message: 'Salary structure updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to update salary structure',
        error: 'Bad Request',
      });
    }
  }

  async deleteStructure(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await salaryRulesService.deleteStructure(id);
      res.status(200).json({
        statusCode: 200,
        message: 'Salary structure deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to delete salary structure',
        error: 'Bad Request',
      });
    }
  }

  // --- RULES ---

  async addRule(req: Request, res: Response): Promise<void> {
    try {
      const structureId = req.params.id as string;
      const parsed = CreateSalaryRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const rule = await salaryRulesService.addRuleToStructure(
        structureId,
        parsed.data
      );
      res.status(201).json({
        statusCode: 201,
        message: 'Salary rule added successfully',
        data: rule,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to add salary rule',
        error: 'Bad Request',
      });
    }
  }

  async updateRule(req: Request, res: Response): Promise<void> {
    try {
      const ruleId = req.params.ruleId as string;
      const parsed = UpdateSalaryRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          statusCode: 400,
          message: parsed.error.issues.map((i) => i.message).join(', '),
          error: 'Bad Request',
        });
        return;
      }

      const updated = await salaryRulesService.updateRule(ruleId, parsed.data);
      res.status(200).json({
        statusCode: 200,
        message: 'Salary rule updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to update salary rule',
        error: 'Bad Request',
      });
    }
  }

  async deleteRule(req: Request, res: Response): Promise<void> {
    try {
      const ruleId = req.params.ruleId as string;
      await salaryRulesService.deleteRule(ruleId);
      res.status(200).json({
        statusCode: 200,
        message: 'Salary rule deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        statusCode: 400,
        message: error.message || 'Failed to delete salary rule',
        error: 'Bad Request',
      });
    }
  }
}

export const salaryRulesController = new SalaryRulesController();
