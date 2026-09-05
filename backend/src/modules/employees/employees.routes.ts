import { Router } from 'express';
import { EmployeesController } from './employees.controller.js';
import { authenticateJWT, authorizeRoles, employeeScope, HR_MANAGER_PLUS } from '../../middlewares/auth.middleware.js'

const router = Router();
const employeesController = new EmployeesController();

router.use(authenticateJWT);

// Create - HR Manager+ only
router.post('/', authorizeRoles(...HR_MANAGER_PLUS), employeesController.create.bind(employeesController));

// Read All - HR Manager+ (Employees cannot list all)
router.get('/', authorizeRoles(...HR_MANAGER_PLUS), employeesController.getAll.bind(employeesController));

// Read Single - Any role, but scoped for EMPLOYEE (can only view their own)
router.get('/:id', employeeScope, employeesController.getById.bind(employeesController));

// Update - HR Manager+
router.patch('/:id', authorizeRoles(...HR_MANAGER_PLUS), employeesController.update.bind(employeesController));

// Sub-resources - scoped so EMPLOYEE can only access their own
router.get('/:id/contracts', employeeScope, employeesController.getContracts.bind(employeesController));
router.get('/:id/attendance', employeeScope, employeesController.getAttendance.bind(employeesController));
router.get('/:id/timeoff', employeeScope, employeesController.getTimeOff.bind(employeesController));
router.get('/:id/allocations', employeeScope, employeesController.getAllocations.bind(employeesController));

export default router;
