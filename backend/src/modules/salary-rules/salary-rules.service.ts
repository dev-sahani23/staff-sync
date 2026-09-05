import prisma from '../../prisma/index.ts';
import type {
  CreateSalaryStructureInput,
  UpdateSalaryStructureInput,
  CreateSalaryRuleInput,
  UpdateSalaryRuleInput,
} from './salary-rules.schema.ts';
import type { SalaryRule } from '@prisma/client';

export class SalaryRulesService {
  // --- SALARY STRUCTURES ---

  async createStructure(data: CreateSalaryStructureInput) {
    return prisma.salaryStructure.create({
      data: {
        name: data.name,
        status: data.status || 'ACTIVE',
      },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async getAllStructures() {
    return prisma.salaryStructure.findMany({
      include: {
        _count: {
          select: {
            rules: true,
            contracts: true,
            payruns: true,
          },
        },
        rules: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStructureById(id: string) {
    const structure = await prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
        contracts: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                jobPosition: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!structure) {
      throw new Error(`Salary structure with ID '${id}' not found`);
    }

    return structure;
  }

  async updateStructure(id: string, data: UpdateSalaryStructureInput) {
    await this.getStructureById(id);

    return prisma.salaryStructure.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
      },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async deleteStructure(id: string) {
    await this.getStructureById(id);

    return prisma.salaryStructure.delete({
      where: { id },
    });
  }

  // --- SALARY RULES ---

  async addRuleToStructure(structureId: string, data: CreateSalaryRuleInput) {
    // 1. Validate structure exists
    const structure = await this.getStructureById(structureId);

    // 2. Validate sequence uniqueness within structure
    const existingSeq = structure.rules.find((r: SalaryRule) => r.sequence === data.sequence);
    if (existingSeq) {
      throw new Error(
        `Sequence ${data.sequence} is already assigned to rule '${existingSeq.name}' (${existingSeq.code}) in this structure`
      );
    }

    // 3. Validate code uniqueness within structure
    const existingCode = structure.rules.find(
      (r: SalaryRule) => r.code.toUpperCase() === data.code.toUpperCase()
    );
    if (existingCode) {
      throw new Error(
        `Rule with code '${data.code}' already exists in this salary structure`
      );
    }

    // 4. If Percentage rule, validate baseCode dependency
    if (data.computeMethod === 'PERCENTAGE' && data.baseCode) {
      const baseCodeUpper = data.baseCode.toUpperCase();
      if (baseCodeUpper !== 'WAGE') {
        const baseRule = structure.rules.find(
          (r: SalaryRule) => r.code.toUpperCase() === baseCodeUpper
        );
        if (!baseRule) {
          throw new Error(
            `Base code '${data.baseCode}' not found in this structure. Percentage rules must reference 'WAGE' or an earlier computed rule.`
          );
        }
        if (baseRule.sequence >= data.sequence) {
          throw new Error(
            `Base rule '${data.baseCode}' (Sequence ${baseRule.sequence}) must execute before this rule (Sequence ${data.sequence}).`
          );
        }
      }
    }

    // 5. Create Rule
    return prisma.salaryRule.create({
      data: {
        salaryStructureId: structureId,
        code: data.code.toUpperCase(),
        name: data.name,
        category: data.category,
        sequence: data.sequence,
        computeMethod: data.computeMethod,
        amount: data.amount ?? null,
        baseCode: data.baseCode ? data.baseCode.toUpperCase() : null,
        formula: data.formula ?? null,
      },
    });
  }

  async updateRule(ruleId: string, data: UpdateSalaryRuleInput) {
    const rule = await prisma.salaryRule.findUnique({
      where: { id: ruleId },
      include: { salaryStructure: { include: { rules: true } } },
    });

    if (!rule) {
      throw new Error(`Salary rule with ID '${ruleId}' not found`);
    }

    // Check sequence collision if sequence is being updated
    if (data.sequence && data.sequence !== rule.sequence) {
      const collision = rule.salaryStructure.rules.find(
        (r: SalaryRule) => r.sequence === data.sequence && r.id !== ruleId
      );
      if (collision) {
        throw new Error(
          `Sequence ${data.sequence} is already assigned to rule '${collision.name}'`
        );
      }
    }

    // Check code collision if code is being updated
    if (data.code && data.code.toUpperCase() !== rule.code) {
      const collision = rule.salaryStructure.rules.find(
        (r: SalaryRule) => r.code.toUpperCase() === data.code!.toUpperCase() && r.id !== ruleId
      );
      if (collision) {
        throw new Error(
          `Rule with code '${data.code}' already exists in this structure`
        );
      }
    }

    return prisma.salaryRule.update({
      where: { id: ruleId },
      data: {
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.sequence !== undefined && { sequence: data.sequence }),
        ...(data.computeMethod && { computeMethod: data.computeMethod }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.baseCode !== undefined && {
          baseCode: data.baseCode ? data.baseCode.toUpperCase() : null,
        }),
        ...(data.formula !== undefined && { formula: data.formula }),
      },
    });
  }

  async deleteRule(ruleId: string) {
    const rule = await prisma.salaryRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new Error(`Salary rule with ID '${ruleId}' not found`);
    }

    return prisma.salaryRule.delete({
      where: { id: ruleId },
    });
  }
}

export const salaryRulesService = new SalaryRulesService();
