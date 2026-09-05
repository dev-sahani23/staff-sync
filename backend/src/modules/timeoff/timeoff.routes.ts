import { Router } from 'express';
import { TimeOffController } from './timeoff.controller.js';
import { authenticateJWT, authorizeRoles, HR_MANAGER_PLUS } from '../../middlewares/auth.middleware.js'

const router = Router();
const timeOffController = new TimeOffController();

router.use(authenticateJWT);

// Types - HR Manager+ can create; all authenticated can view types list
router.post('/types', authorizeRoles(...HR_MANAGER_PLUS), timeOffController.createType.bind(timeOffController));
router.get('/types', timeOffController.getTypes.bind(timeOffController));

// Allocations - HR Manager+ can create; all authenticated can view (scoped in controller for EMPLOYEE)
router.post('/allocations', authorizeRoles(...HR_MANAGER_PLUS), timeOffController.createAllocation.bind(timeOffController));
router.get('/allocations', timeOffController.getAllocations.bind(timeOffController));

// Requests - any authenticated user can create a request for themselves
router.post('/requests', timeOffController.createRequest.bind(timeOffController));
router.get('/requests', timeOffController.getRequests.bind(timeOffController));

// Approve / Refuse - HR Manager+ only
router.patch('/requests/:id/approve', authorizeRoles(...HR_MANAGER_PLUS), timeOffController.approve.bind(timeOffController));
router.patch('/requests/:id/refuse', authorizeRoles(...HR_MANAGER_PLUS), timeOffController.refuse.bind(timeOffController));

export default router;
