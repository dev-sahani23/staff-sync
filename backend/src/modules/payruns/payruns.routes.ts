import { Router } from 'express';
import { payrunsController } from './payruns.controller.ts';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../middlewares/auth.middleware.ts';
import { Role } from '@prisma/client';

const router = Router();

// All payrun routes require authentication
router.use(authenticateJWT);

// Wizard Step 1: Preview Scope
router.post(
  '/draft',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => payrunsController.previewDraftScope(req, res)
);

// Wizard Step 2: Create Payrun Batch
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => payrunsController.createPayrun(req, res)
);

// List all Payruns
router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => payrunsController.getAllPayruns(req, res)
);

// Get Payrun Detail
router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => payrunsController.getPayrunById(req, res)
);

// Step 3: Compute Payrun
router.post(
  '/:id/compute',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER),
  (req, res) => payrunsController.computePayrun(req, res)
);

// Step 4a: Validate Payrun (HR Payroll Manager / Admin)
router.patch(
  '/:id/validate',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => payrunsController.validatePayrun(req, res)
);

// Step 4b: Mark as Paid (HR Payroll Manager / Admin)
router.patch(
  '/:id/mark-paid',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => payrunsController.markPaid(req, res)
);

// Step 5: Send Payslips via Email (HR Payroll Manager / Admin)
router.post(
  '/:id/send',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => payrunsController.sendPayrunPayslips(req, res)
);

// Delete Payrun (if not PAID)
router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.HR_PAYROLL_MANAGER),
  (req, res) => payrunsController.deletePayrun(req, res)
);

export default router;
