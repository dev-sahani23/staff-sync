import prisma from '../src/prisma/index.ts';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seed for PeoplePay360...');

  // 1. Clear existing records in proper relational order
  await prisma.payslipLine.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.salaryRule.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveAllocation.deleteMany();
  await prisma.timeOffType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.scheduleLine.deleteMany();
  await prisma.workingSchedule.deleteMany();
  await prisma.employee.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Working Schedule
  const schedule = await prisma.workingSchedule.create({
    data: {
      name: 'Standard 40h Work Week',
      type: 'FULL_TIME',
      lines: {
        create: [1, 2, 3, 4, 5].map((day) => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          breakMinutes: 60,
        })),
      },
    },
  });

  // 3. Create Admin & HR Payroll Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@peoplepay.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const payrollManagerUser = await prisma.user.create({
    data: {
      email: 'payroll.manager@peoplepay.com',
      passwordHash,
      role: 'HR_PAYROLL_MANAGER',
    },
  });

  // 4. Create Employees
  const emp1 = await prisma.employee.create({
    data: {
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@peoplepay.com',
      phone: '+91 9876543210',
      jobPosition: 'Senior Software Engineer',
      department: 'Engineering',
      status: 'ACTIVE',
      scheduleId: schedule.id,
      bankName: 'HDFC Bank',
      accountNumber: '50100456789123',
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      firstName: 'Priya',
      lastName: 'Verma',
      email: 'priya.verma@peoplepay.com',
      phone: '+91 9876543211',
      jobPosition: 'Product Designer',
      department: 'Design',
      status: 'ACTIVE',
      scheduleId: schedule.id,
      bankName: 'ICICI Bank',
      accountNumber: '001101567890',
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@peoplepay.com',
      phone: '+91 9876543212',
      jobPosition: 'HR Specialist',
      department: 'Human Resources',
      status: 'ACTIVE',
      scheduleId: schedule.id,
      bankName: null, // intentionally missing to test Payroll Warning!
      accountNumber: null,
    },
  });

  // Link employee users
  await prisma.user.create({
    data: {
      email: emp1.email,
      passwordHash,
      role: 'EMPLOYEE',
      employeeId: emp1.id,
    },
  });

  // 5. Create Salary Structure & Rules
  const salaryStructure = await prisma.salaryStructure.create({
    data: {
      name: 'Standard Indian Corporate Structure',
      status: 'ACTIVE',
      rules: {
        create: [
          {
            code: 'BASIC',
            name: 'Basic Salary',
            category: 'BASIC',
            sequence: 1,
            computeMethod: 'PERCENTAGE',
            amount: 50,
            baseCode: 'WAGE',
          },
          {
            code: 'HRA',
            name: 'House Rent Allowance',
            category: 'ALLOWANCE',
            sequence: 2,
            computeMethod: 'PERCENTAGE',
            amount: 40,
            baseCode: 'BASIC',
          },
          {
            code: 'CONVEYANCE',
            name: 'Conveyance Allowance',
            category: 'ALLOWANCE',
            sequence: 3,
            computeMethod: 'FIXED',
            amount: 3000,
          },
          {
            code: 'SPECIAL',
            name: 'Special Allowance',
            category: 'ALLOWANCE',
            sequence: 4,
            computeMethod: 'FORMULA',
            formula: 'WAGE - BASIC - HRA - CONVEYANCE',
          },
          {
            code: 'PF',
            name: 'Provident Fund',
            category: 'DEDUCTION',
            sequence: 5,
            computeMethod: 'PERCENTAGE',
            amount: 12,
            baseCode: 'BASIC',
          },
          {
            code: 'PROF_TAX',
            name: 'Professional Tax',
            category: 'DEDUCTION',
            sequence: 6,
            computeMethod: 'FIXED',
            amount: 200,
          },
          {
            code: 'NET',
            name: 'Net Salary',
            category: 'NET',
            sequence: 7,
            computeMethod: 'FORMULA',
            formula: 'BASIC + HRA + CONVEYANCE + SPECIAL - PF - PROF_TAX',
          },
        ],
      },
    },
  });

  // 6. Create Active Contracts
  await prisma.contract.create({
    data: {
      employeeId: emp1.id,
      salaryStructureId: salaryStructure.id,
      wage: 80000,
      startDate: new Date('2026-01-01'),
      status: 'ACTIVE',
      department: emp1.department,
      jobPosition: emp1.jobPosition,
    },
  });

  await prisma.contract.create({
    data: {
      employeeId: emp2.id,
      salaryStructureId: salaryStructure.id,
      wage: 65000,
      startDate: new Date('2026-01-01'),
      status: 'ACTIVE',
      department: emp2.department,
      jobPosition: emp2.jobPosition,
    },
  });

  await prisma.contract.create({
    data: {
      employeeId: emp3.id,
      salaryStructureId: salaryStructure.id,
      wage: 50000,
      startDate: new Date('2026-01-01'),
      status: 'ACTIVE',
      department: emp3.department,
      jobPosition: emp3.jobPosition,
    },
  });

  // 7. Create Sample Attendance records for this month
  const today = new Date();
  for (let d = 1; d <= 20; d++) {
    const attendanceDate = new Date(today.getFullYear(), today.getMonth(), d);
    await prisma.attendance.create({
      data: {
        employeeId: emp1.id,
        date: attendanceDate,
        checkIn: new Date(attendanceDate.setHours(9, 0, 0)),
        checkOut: new Date(attendanceDate.setHours(18, 0, 0)),
        workedHours: 8,
        status: 'PRESENT',
      },
    });
  }

  console.log('✅ Demo seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Login Credentials:');
  console.log('   Admin:           admin@peoplepay.com / password123');
  console.log('   Payroll Manager: payroll.manager@peoplepay.com / password123');
  console.log('   Employee:        rahul.sharma@peoplepay.com / password123');
  console.log('----------------------------------------------------');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
