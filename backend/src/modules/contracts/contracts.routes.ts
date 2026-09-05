import { Router } from 'express';
import { ContractsController } from './contracts.controller.js';
import { authenticateJWT, authorizeRoles, HR_MANAGER_PLUS, PAYROLL_USER_PLUS } from '../../middlewares/auth.middleware.js';

const router = Router();
const contractsController = new ContractsController();

router.use(authenticateJWT);

// Lookup - internal helper for Payroll, also available to HR
router.get('/lookup', authorizeRoles(...HR_MANAGER_PLUS), contractsController.lookup.bind(contractsController));

// CRUD - only HR Manager+ can create / update / activate
router.post('/', authorizeRoles(...HR_MANAGER_PLUS), contractsController.create.bind(contractsController));
router.get('/', authorizeRoles(...HR_MANAGER_PLUS), contractsController.getAll.bind(contractsController));
router.patch('/:id', authorizeRoles(...HR_MANAGER_PLUS), contractsController.update.bind(contractsController));
router.patch('/:id/activate', authorizeRoles(...HR_MANAGER_PLUS), contractsController.activate.bind(contractsController));

export default router;
