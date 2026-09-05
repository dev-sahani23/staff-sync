import prisma from '../../prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export class AuthService {
  async register(email: string, passwordRaw: string, role: Role = 'EMPLOYEE', employeeId?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 10);
    
    let empId = employeeId;
    if (!empId) {
      const existingEmployee = await prisma.employee.findUnique({ where: { email } });
      if (existingEmployee) {
        empId = existingEmployee.id;
      } else {
        const employee = await prisma.employee.create({
          data: {
            firstName: email.split('@')[0],
            lastName: 'User',
            email: email,
            status: 'ACTIVE'
          }
        });
        empId = employee.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        employeeId: empId
      }
    });

    // Exclude passwordHash from returned object
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      employeeId: user.employeeId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '8h'
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId
      }
    };
  }
}
