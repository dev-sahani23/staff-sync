import { Router } from 'express';
import { payslipsController } from './payslips.controller.ts';
import { authenticateJWT } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(authenticateJWT);

// Employee self-service payslip history
router.get('/my', (req, res) => payslipsController.getMyPayslips(req, res));

// View single payslip
router.get('/:id', (req, res) => payslipsController.getPayslipById(req, res));

// Stream printable PDF
router.get('/:id/pdf', (req, res) => payslipsController.downloadPdf(req, res));

export default router;
