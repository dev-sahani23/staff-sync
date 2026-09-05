import { Router } from 'express';
import { TimeOffController } from './timeoff.controller.js';
import { authenticateJWT, authorizeRoles, employeeScope } from '../../middlewares/auth.middleware.js'

const router = Router();
const timeOffController = new TimeOffController();

router.use(authenticateJWT);

// Types
router.post('/types', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), timeOffController.createType.bind(timeOffController));
router.get('/types', timeOffController.getTypes.bind(timeOffController));

// Allocations
router.post('/allocations', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), timeOffController.createAllocation.bind(timeOffController));
router.get('/allocations', timeOffController.getAllocations.bind(timeOffController));

// Requests
router.post('/requests', timeOffController.createRequest.bind(timeOffController)); // Employee self or HR
router.get('/requests', timeOffController.getRequests.bind(timeOffController));
router.patch('/requests/:id/approve', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), timeOffController.approve.bind(timeOffController));
router.patch('/requests/:id/refuse', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), timeOffController.refuse.bind(timeOffController));

export default router;
