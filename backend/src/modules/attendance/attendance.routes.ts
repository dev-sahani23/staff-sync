import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticateJWT, authorizeRoles, employeeScope } from '../../middlewares/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

router.use(authenticateJWT);

// Create check-in/out
router.post('/check-in', attendanceController.checkIn.bind(attendanceController));
router.post('/:id/check-out', attendanceController.checkOut.bind(attendanceController)); // Can be restricted to the owner of the record in controller or middleware

// Read - open to authenticated but filtered by scope usually, handled in controller/service in real app
router.get('/', attendanceController.getAll.bind(attendanceController));

// HR Manager+ correction
router.patch('/:id/correct', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), attendanceController.correct.bind(attendanceController));

export default router;
