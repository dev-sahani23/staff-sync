import { Router } from 'express';
import { SchedulesController } from './schedules.controller';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();
const schedulesController = new SchedulesController();

router.use(authenticateJWT);

// HR Manager+ can create, update, delete schedules
router.post('/', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), schedulesController.create.bind(schedulesController));
router.put('/:id', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), schedulesController.update.bind(schedulesController));
router.delete('/:id', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), schedulesController.delete.bind(schedulesController));

// Everyone authenticated can view schedules (or maybe restrict to HR only, but employees might need to see their own. For now, open to authenticated)
router.get('/', schedulesController.getAll.bind(schedulesController));
router.get('/:id', schedulesController.getById.bind(schedulesController));

export default router;
