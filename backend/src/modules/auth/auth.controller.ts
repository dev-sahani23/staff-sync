import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, employeeId } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ statusCode: 400, message: 'Email and password are required', error: 'Bad Request' });
        return;
      }

      const user = await authService.register(email, password, role, employeeId);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ statusCode: 400, message: error.message, error: 'Bad Request' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ statusCode: 400, message: 'Email and password are required', error: 'Bad Request' });
        return;
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ statusCode: 401, message: error.message, error: 'Unauthorized' });
    }
  }
}
