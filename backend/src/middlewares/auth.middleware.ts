import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// ── Standardised role groups (PS-aligned) ──────────────────────────
// HR_MANAGER_PLUS   → any HR-level or higher
// PAYROLL_USER_PLUS → payroll read/compute + manager + admin
// PAYROLL_MANAGER_PLUS → payroll approval/send + admin
export const HR_MANAGER_PLUS: Role[] = [
  Role.HR_MANAGER,
  Role.HR_PAYROLL_USER,
  Role.HR_PAYROLL_MANAGER,
  Role.ADMIN,
];

export const PAYROLL_USER_PLUS: Role[] = [
  Role.HR_PAYROLL_USER,
  Role.HR_PAYROLL_MANAGER,
  Role.ADMIN,
];

export const PAYROLL_MANAGER_PLUS: Role[] = [
  Role.HR_PAYROLL_MANAGER,
  Role.ADMIN,
];

export type AuthUser = {
  userId: string;
  role: Role;
  employeeId: string | null;
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token as string, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token', error: 'Forbidden' });
      }

      req.user = user as AuthUser;
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
