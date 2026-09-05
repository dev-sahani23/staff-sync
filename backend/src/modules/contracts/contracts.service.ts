import prisma from '../../prisma/index.js';
import { ContractStatus } from '@prisma/client';

export class ContractsService {
  async assertNoOverlappingActiveContract(employeeId: string, startDate: Date, endDate?: Date | null) {
    const overlapping = await prisma.contract.findFirst({
      where: {
        employeeId,
        status: ContractStatus.ACTIVE,
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gte: startDate
            }
          }
        ]
        // If the new contract has an endDate, we might also check if old startDate <= new endDate
        // But simplified logic here: if existing is active and its end date is null or after new start date, it's overlapping.
      }
    });

    if (overlapping) {
      throw new Error('Contract date range overlaps with an existing active contract');
    }
  }

  async createContract(data: any) {
    if (data.status === ContractStatus.ACTIVE) {
      await this.assertNoOverlappingActiveContract(data.employeeId, new Date(data.startDate), data.endDate ? new Date(data.endDate) : null);
    }
    return prisma.contract.create({ data });
  }

  async updateContract(id: string, data: any) {
    return prisma.contract.update({
      where: { id },
      data
    });
  }

  async activateContract(id: string) {
    const contractToActivate = await prisma.contract.findUnique({ where: { id } });
    if (!contractToActivate) throw new Error('Contract not found');

    if (contractToActivate.status === ContractStatus.ACTIVE) {
      return contractToActivate;
    }

    // Auto-expire previous active contracts
    await prisma.contract.updateMany({
      where: {
        employeeId: contractToActivate.employeeId,
        status: ContractStatus.ACTIVE,
        id: { not: id }
      },
      data: {
        status: ContractStatus.EXPIRED,
        endDate: new Date()
      }
    });

    return prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.ACTIVE
      }
    });
  }

  async getContracts() {
    return prisma.contract.findMany();
  }

  async findValidContractForPeriod(employeeId: string, periodStart: string, periodEnd: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    
    // Finds active contracts that intersect with the given period
    return prisma.contract.findFirst({
      where: {
        employeeId,
        status: ContractStatus.ACTIVE,
        startDate: { lte: end },
        OR: [
          { endDate: null },
          { endDate: { gte: start } }
        ]
      }
    });
  }
}
