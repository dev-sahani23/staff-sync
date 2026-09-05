import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Admin or seed only
router.post('/register', authenticateJWT, authorizeRoles('ADMIN'), authController.register.bind(authController));

router.post('/login', authController.login.bind(authController));

export default router;
