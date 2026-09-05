import { Router } from 'express';
import { salaryRulesController } from './salary-rules.controller.ts';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../middlewares/auth.middleware.ts';
import { Role } from '@prisma/client';

const router = Router();

// Middleware: All routes require authentication
router.use(authenticateJWT);

// Structure CRUD
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.createStructure(req, res)
);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => salaryRulesController.getAllStructures(req, res)
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => salaryRulesController.getStructureById(req, res)
);

router.patch(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.updateStructure(req, res)
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.deleteStructure(req, res)
);

// Rules Nested CRUD
router.post(
  '/:id/rules',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.addRule(req, res)
);

router.patch(
  '/:id/rules/:ruleId',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.updateRule(req, res)
);

router.delete(
  '/:id/rules/:ruleId',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => salaryRulesController.deleteRule(req, res)
);

export default router;
