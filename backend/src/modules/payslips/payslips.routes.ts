import { Router } from 'express';
import { payslipsController } from './payslips.controller.ts';
import { authenticateJWT, authorizeRoles, PAYROLL_USER_PLUS } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(authenticateJWT);

// List all payslips (HR/Admin see all, Employees see own)
router.get('/', (req, res) => payslipsController.getAllPayslips(req, res));

// Employee self-service payslip history (any authenticated employee can see their own)
router.get('/my', (req, res) => payslipsController.getMyPayslips(req, res));

// View single payslip - payroll users see any, employees only their own (enforced in controller)
router.get('/:id', (req, res) => payslipsController.getPayslipById(req, res));

// Stream printable PDF - same access as viewing
router.get('/:id/pdf', (req, res) => payslipsController.downloadPdf(req, res));

export default router;
