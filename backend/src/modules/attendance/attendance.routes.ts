import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { authenticateJWT, authorizeRoles, HR_MANAGER_PLUS } from '../../middlewares/auth.middleware.js';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

const router = Router();
const attendanceController = new AttendanceController();

router.use(authenticateJWT);

// Create check-in/out - any authenticated user for themselves
router.post('/check-in', attendanceController.checkIn.bind(attendanceController));
router.post('/:id/check-out', attendanceController.checkOut.bind(attendanceController));

// Read all - HR Manager+ sees global, Employees see only their own (handled via query filter in controller)
router.get('/', attendanceController.getAll.bind(attendanceController));

// HR Manager+ correction
router.patch('/:id/correct', authorizeRoles(...HR_MANAGER_PLUS), attendanceController.correct.bind(attendanceController));

export default router;
