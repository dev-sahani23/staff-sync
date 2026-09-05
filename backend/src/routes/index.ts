import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.ts';
import schedulesRoutes from '../modules/schedules/schedules.routes.ts';
import employeesRoutes from '../modules/employees/employees.routes.ts';
import contractsRoutes from '../modules/contracts/contracts.routes.ts';
import attendanceRoutes from '../modules/attendance/attendance.routes.ts';
import timeOffRoutes from '../modules/timeoff/timeoff.routes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/employees', employeesRoutes);
router.use('/contracts', contractsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timeoff', timeOffRoutes);

export default router;
