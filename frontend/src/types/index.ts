// Shared domain types matching backend models

export type Role = 
  | 'EMPLOYEE' 
  | 'HR_MANAGER' 
  | 'HR_PAYROLL_USER' 
  | 'HR_PAYROLL_MANAGER' 
  | 'ADMIN';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCEPTION' | 'CORRECTED';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REFUSED';

export type RuleCategory = 'BASIC' | 'ALLOWANCE' | 'DEDUCTION' | 'GROSS' | 'NET';

export type ComputeMethod = 'FIXED' | 'PERCENTAGE' | 'FORMULA';

export type PayrunStatus = 'DRAFT' | 'COMPUTED' | 'VALIDATED' | 'PAID';

export interface User {
  id: string;
  email: string;
  role: Role;
  employeeId?: string | null;
  isActive?: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  jobPosition?: string | null;
  department?: string | null;
  status: EmployeeStatus;
  managerId?: string | null;
  scheduleId?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  schedule?: WorkingSchedule | null;
}

export interface ScheduleLine {
  id: string;
  workingScheduleId: string;
  dayOfWeek: number; // 1=Mon .. 7=Sun
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  breakMinutes: number;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  type?: string | null;
  createdAt: string;
  updatedAt: string;
  lines?: ScheduleLine[];
}

export interface Contract {
  id: string;
  employeeId: string;
  salaryStructureId: string;
  wage: number;
  startDate: string;
  endDate?: string | null;
  status: ContractStatus;
  department?: string | null;
  jobPosition?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string | null;
    jobPosition?: string | null;
  };
  salaryStructure?: {
    id: string;
    name: string;
  };
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workedHours?: number | null;
  status: AttendanceStatus;
  correctedBy?: string | null;
  correctionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TimeOffType {
  id: string;
  name: string;
  unit: 'DAYS' | 'HOURS';
  requiresAllocation: boolean;
  isPayrollIntegrated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  timeOffTypeId: string;
  allocated: number;
  taken: number;
  remaining?: number;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  timeOffType?: TimeOffType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  timeOffTypeId: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: LeaveRequestStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  timeOffType?: TimeOffType;
}

export interface SalaryRule {
  id: string;
  salaryStructureId: string;
  code: string;
  name: string;
  category: RuleCategory;
  sequence: number;
  computeMethod: ComputeMethod;
  amount?: number | null;
  baseCode?: string | null;
  formula?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  rules?: SalaryRule[];
  _count?: {
    contracts: number;
    rules: number;
  };
  contracts?: Array<{
    id: string;
    employee: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface Payrun {
  id: string;
  name: string;
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
  status: PayrunStatus;
  createdAt: string;
  updatedAt: string;
  salaryStructure?: {
    id: string;
    name: string;
  };
  payslips?: Payslip[];
  _count?: {
    payslips: number;
  };
}

export interface PayslipLine {
  id: string;
  payslipId: string;
  salaryRuleId: string;
  label: string;
  amount: number;
  salaryRule?: SalaryRule;
}

export interface Payslip {
  id: string;
  payrunId: string;
  employeeId: string;
  contractId: string;
  workedDays: number;
  warnings?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bankName?: string | null;
    accountNumber?: string | null;
    jobPosition?: string | null;
    department?: string | null;
  };
  contract?: {
    id: string;
    wage: number;
    salaryStructure?: {
      name: string;
    };
  };
  payrun?: {
    id: string;
    name: string;
    periodStart: string;
    periodEnd: string;
    status: PayrunStatus;
  };
  lines?: PayslipLine[];
}

export interface DashboardKpis {
  totalNetSalaryPaid: number;
  totalPayslipsGenerated: number;
  averageSalary: number;
  activeEmployees: number;
  approvedTimeOffDays: number;
  attendanceHealthPercentage: number;
}
