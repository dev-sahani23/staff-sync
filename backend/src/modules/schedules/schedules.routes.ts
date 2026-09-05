import { Router } from 'express';
import { SchedulesController } from './schedules.controller.js';
import { authenticateJWT, authorizeRoles, HR_MANAGER_PLUS } from '../../middlewares/auth.middleware.js';

const router = Router();
const schedulesController = new SchedulesController();

router.use(authenticateJWT);

// HR Manager+ can create, update, delete schedules
router.post('/', authorizeRoles(...HR_MANAGER_PLUS), schedulesController.create.bind(schedulesController));
router.put('/:id', authorizeRoles(...HR_MANAGER_PLUS), schedulesController.update.bind(schedulesController));
router.delete('/:id', authorizeRoles(...HR_MANAGER_PLUS), schedulesController.delete.bind(schedulesController));

// Everyone authenticated can view schedules (employees might need to see their own)
router.get('/', schedulesController.getAll.bind(schedulesController));
router.get('/:id', schedulesController.getById.bind(schedulesController));

export default router;
