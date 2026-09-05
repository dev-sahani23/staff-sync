import { Router } from 'express';
import { ContractsController } from './contracts.controller.js';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = Router();
const contractsController = new ContractsController();

router.use(authenticateJWT);

// Lookup - internal helper for Payroll, but also available to HR
router.get('/lookup', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'), contractsController.lookup.bind(contractsController));

// CRUD
router.post('/', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), contractsController.create.bind(contractsController));
router.get('/', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'), contractsController.getAll.bind(contractsController));
router.patch('/:id', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), contractsController.update.bind(contractsController));
router.patch('/:id/activate', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), contractsController.activate.bind(contractsController));

export default router;
