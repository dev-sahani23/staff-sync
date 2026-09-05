import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import schedulesRoutes from '../modules/schedules/schedules.routes.js';
import employeesRoutes from '../modules/employees/employees.routes.js';
import contractsRoutes from '../modules/contracts/contracts.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import timeOffRoutes from '../modules/timeoff/timeoff.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/employees', employeesRoutes);
router.use('/contracts', contractsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timeoff', timeOffRoutes);

export default router;
