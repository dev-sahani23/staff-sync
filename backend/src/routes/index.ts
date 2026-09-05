import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.ts';
import schedulesRoutes from '../modules/schedules/schedules.routes.ts';
import employeesRoutes from '../modules/employees/employees.routes.ts';
import contractsRoutes from '../modules/contracts/contracts.routes.ts';
import attendanceRoutes from '../modules/attendance/attendance.routes.ts';
import timeOffRoutes from '../modules/timeoff/timeoff.routes.ts';
import salaryStructureRoutes from "../modules/salary-rules/salary-rules.routes.ts"
import payrunsRoutes from "../modules/payruns/payruns.routes.ts"
import payslipsRoutes from "../modules/payslips/payslips.routes.ts"
import dashboardRoutes from "../modules/dashboard/dashboard.routes.ts"

const router = Router();

router.use('/auth', authRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/employees', employeesRoutes);
router.use('/contracts', contractsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timeoff', timeOffRoutes);
router.use('/salary-structures', salaryStructureRoutes);
router.use('/payruns', payrunsRoutes);
router.use('/payslips', payslipsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
