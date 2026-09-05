import type { Request, Response } from 'express';
import { ContractsService } from './contracts.service.js';

const contractsService = new ContractsService();

export class ContractsController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const contract = await contractsService.createContract(req.body);
      res.status(201).json(contract);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const contracts = await contractsService.getContracts();
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const contract = await contractsService.updateContract(req.params.id as string, req.body);
      res.json(contract);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async activate(req: Request, res: Response): Promise<void> {
    try {
      const contract = await contractsService.activateContract(req.params.id as string)
        ;
      res.json(contract);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async lookup(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, periodStart, periodEnd } = req.query;
      
      if (!employeeId || !periodStart || !periodEnd) {
        res.status(400).json({ statusCode: 400, message: 'Missing required query parameters', error: 'Bad Request' });
        return;
      }

      const contract = await contractsService.findValidContractForPeriod(
        employeeId as string,
        periodStart as string,
        periodEnd as string
      );
      
      if (!contract) {
        res.status(404).json({ statusCode: 404, message: 'No valid contract found for period', error: 'Not Found' });
        return;
      }

      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, message: error.message, error: 'Internal Server Error' });
    }
  }
}
