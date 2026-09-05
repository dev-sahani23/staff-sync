import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
    employeeId: string | null;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token', error: 'Forbidden' });
      }

      req.user = user as AuthRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: Missing token', error: 'Unauthorized' });
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges', error: 'Forbidden' });
      return;
    }
    next();
  };
};

export const employeeScope = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role === 'EMPLOYEE') {
    // If they are an EMPLOYEE, ensure they are requesting their own data
    // Assuming the resource ID is either in req.params.id or req.params.employeeId or query
    const targetEmployeeId = req.params.employeeId || req.params.id || req.query.employeeId;
    if (targetEmployeeId && targetEmployeeId !== req.user.employeeId) {
      res.status(403).json({ message: 'Forbidden: Cannot access other employee records', error: 'Forbidden' });
      return;
    }
  }
  next();
};
