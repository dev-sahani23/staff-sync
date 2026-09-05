import { Router } from 'express';
import { dashboardController } from './dashboard.controller.ts';
import {
  authenticateJWT,
  authorizeRoles,
  HR_MANAGER_PLUS,
} from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(...HR_MANAGER_PLUS));

// 1. KPI Metric Cards
router.get('/kpis', (req, res) => dashboardController.getKpis(req, res));

// 2. Department Salary Costs Breakdown
router.get('/salary-cost-by-department', (req, res) =>
  dashboardController.getSalaryCostByDepartment(req, res)
);

// 3. Monthly Net Salary Trends
router.get('/monthly-net-trend', (req, res) =>
  dashboardController.getMonthlyNetTrend(req, res)
);

// 4. Attendance Overview Summary
router.get('/attendance-overview', (req, res) =>
  dashboardController.getAttendanceOverview(req, res)
);

// 5. Operational Alerts & Warnings
router.get('/alerts', (req, res) => dashboardController.getAlerts(req, res));

export default router;
