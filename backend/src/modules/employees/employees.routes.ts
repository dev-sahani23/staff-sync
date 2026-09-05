import { Router } from 'express';
import { EmployeesController } from './employees.controller.js';
import { authenticateJWT, authorizeRoles, employeeScope } from '../../middlewares/auth.middleware.js'
const router = Router();
const employeesController = new EmployeesController();

router.use(authenticateJWT);

// Create - HR Manager+ only
router.post('/', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), employeesController.create.bind(employeesController));

// Read All - HR Manager+ or specific roles (Employees can't list all, maybe just see their own via /:id)
router.get('/', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), employeesController.getAll.bind(employeesController));

// Read Single - Any role, but scoped for EMPLOYEE
router.get('/:id', employeeScope, employeesController.getById.bind(employeesController));

// Update - HR Manager+
router.patch('/:id', authorizeRoles('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), employeesController.update.bind(employeesController));

// Sub-resources
router.get('/:id/contracts', employeeScope, employeesController.getContracts.bind(employeesController));
router.get('/:id/attendance', employeeScope, employeesController.getAttendance.bind(employeesController));
router.get('/:id/timeoff', employeeScope, employeesController.getTimeOff.bind(employeesController));
router.get('/:id/allocations', employeeScope, employeesController.getAllocations.bind(employeesController));

export default router;
