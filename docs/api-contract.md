# PeoplePay360 — Backend API Contract (Step 0 Reconciliation)

This document reflects the ground truth extracted by crawling the Express + Prisma backend in `backend/src`.

## General Architecture
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer token in the `Authorization: Bearer <accessToken>` header.
- **Token Payload**: `{ userId: string, role: Role, employeeId: string | null }`
- **User Roles**: `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Role Groups (Backend Middleware)**:
  - `HR_MANAGER_PLUS`: `['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']`
  - `PAYROLL_USER_PLUS`: `['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']`
  - `PAYROLL_MANAGER_PLUS`: `['HR_PAYROLL_MANAGER', 'ADMIN']`
  - `EMPLOYEE`: Scoped to own `employeeId` for single-record retrieval

---

## 1. Authentication (`/api/auth`)
| Method | Path | Auth | Roles | Request Body | Response Shape |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Any | `{ email, password, role?, employeeId? }` | `{ id, email, role, employeeId, isActive, createdAt, updatedAt }` |
| `POST` | `/api/auth/login` | Public | Any | `{ email, password }` | `{ accessToken: string, user: { id, email, role, employeeId } }` |

---

## 2. Employees (`/api/employees`)
| Method | Path | Auth | Roles | Request Body / Query | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/employees` | Bearer | `HR_MANAGER_PLUS` | `?department=&status=&managerId=` | `Employee[]` (includes schedule, manager) |
| `POST` | `/api/employees` | Bearer | `HR_MANAGER_PLUS` | `{ firstName, lastName, email, phone?, jobPosition?, department?, status?, managerId?, scheduleId?, bankName?, accountNumber? }` | `Employee` |
| `GET` | `/api/employees/:id` | Bearer | Any (scoped for EMPLOYEE) | None | `Employee` (includes schedule, manager) |
| `PATCH` | `/api/employees/:id` | Bearer | `HR_MANAGER_PLUS` | Partial employee object | `Employee` |
| `GET` | `/api/employees/:id/contracts` | Bearer | Any (scoped) | None | `Contract[]` |
| `GET` | `/api/employees/:id/attendance` | Bearer | Any (scoped) | None | `Attendance[]` |
| `GET` | `/api/employees/:id/timeoff` | Bearer | Any (scoped) | None | `LeaveRequest[]` |
| `GET` | `/api/employees/:id/allocations` | Bearer | Any (scoped) | None | `LeaveAllocation[]` |

---

## 3. Contracts (`/api/contracts`)
| Method | Path | Auth | Roles | Request Body / Query | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/contracts` | Bearer | `HR_MANAGER_PLUS` | None | `Contract[]` (includes employee, salaryStructure) |
| `POST` | `/api/contracts` | Bearer | `HR_MANAGER_PLUS` | `{ employeeId, salaryStructureId, wage, startDate, endDate?, status?, department?, jobPosition? }` | `Contract` |
| `PATCH` | `/api/contracts/:id` | Bearer | `HR_MANAGER_PLUS` | Partial contract object | `Contract` |
| `PATCH` | `/api/contracts/:id/activate` | Bearer | `HR_MANAGER_PLUS` | None | `Contract` (sets status to ACTIVE) |
| `GET` | `/api/contracts/lookup` | Bearer | `HR_MANAGER_PLUS` | `?employeeId=&periodStart=&periodEnd=` | `Contract` |

---

## 4. Working Schedules (`/api/schedules`)
| Method | Path | Auth | Roles | Request Body | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/schedules` | Bearer | Any | None | `WorkingSchedule[]` (includes lines) |
| `GET` | `/api/schedules/:id` | Bearer | Any | None | `WorkingSchedule` (includes lines) |
| `POST` | `/api/schedules` | Bearer | `HR_MANAGER_PLUS` | `{ name, type?, lines?: Array<{ dayOfWeek, startTime, endTime, breakMinutes }> }` | `WorkingSchedule` |
| `PUT` | `/api/schedules/:id` | Bearer | `HR_MANAGER_PLUS` | `{ name, type?, lines?: Array<{ dayOfWeek, startTime, endTime, breakMinutes }> }` | `WorkingSchedule` |
| `DELETE` | `/api/schedules/:id` | Bearer | `HR_MANAGER_PLUS` | None | HTTP 204 No Content |

---

## 5. Attendance (`/api/attendance`)
| Method | Path | Auth | Roles | Request Body / Query | Response Shape |
|---|---|---|---|---|---|
| `POST` | `/api/attendance/check-in` | Bearer | Any (self) | `{ employeeId? }` | `Attendance` |
| `POST` | `/api/attendance/:id/check-out` | Bearer | Any (self) | None | `Attendance` |
| `GET` | `/api/attendance` | Bearer | Any (scoped) | `?employeeId=&date=&status=` | `Attendance[]` |
| `PATCH` | `/api/attendance/:id/correct` | Bearer | `HR_MANAGER_PLUS` | `{ checkIn?, checkOut?, workedHours?, status?, correctionNotes? }` | `Attendance` |

---

## 6. Time Off (`/api/timeoff`)
| Method | Path | Auth | Roles | Request Body / Query | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/timeoff/types` | Bearer | Any | None | `TimeOffType[]` |
| `POST` | `/api/timeoff/types` | Bearer | `HR_MANAGER_PLUS` | `{ name, unit, requiresAllocation?, isPayrollIntegrated? }` | `TimeOffType` |
| `GET` | `/api/timeoff/allocations` | Bearer | Any (scoped) | None | `LeaveAllocation[]` (with computed `remaining`) |
| `POST` | `/api/timeoff/allocations` | Bearer | `HR_MANAGER_PLUS` | `{ employeeId, timeOffTypeId, allocated }` | `LeaveAllocation` |
| `GET` | `/api/timeoff/requests` | Bearer | Any (scoped) | None | `LeaveRequest[]` (includes employee, timeOffType) |
| `POST` | `/api/timeoff/requests` | Bearer | Any (self) | `{ employeeId, timeOffTypeId, startDate, endDate, duration, notes? }` | `LeaveRequest` |
| `PATCH` | `/api/timeoff/requests/:id/approve` | Bearer | `HR_MANAGER_PLUS` | None | `LeaveRequest` (status: APPROVED, deducts allocation) |
| `PATCH` | `/api/timeoff/requests/:id/refuse` | Bearer | `HR_MANAGER_PLUS` | None | `LeaveRequest` (status: REFUSED) |

---

## 7. Salary Structures & Rules (`/api/salary-structures`)
| Method | Path | Auth | Roles | Request Body | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/salary-structures` | Bearer | `PAYROLL_USER_PLUS` | None | `{ statusCode: 200, data: SalaryStructure[] }` (includes rules, _count) |
| `GET` | `/api/salary-structures/:id` | Bearer | `PAYROLL_USER_PLUS` | None | `{ statusCode: 200, data: SalaryStructure }` (includes rules, contracts) |
| `POST` | `/api/salary-structures` | Bearer | `PAYROLL_MANAGER_PLUS` | `{ name, status? }` | `{ statusCode: 201, data: SalaryStructure }` |
| `PATCH` | `/api/salary-structures/:id` | Bearer | `PAYROLL_MANAGER_PLUS` | `{ name?, status? }` | `{ statusCode: 200, data: SalaryStructure }` |
| `DELETE` | `/api/salary-structures/:id` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, message: string }` |
| `POST` | `/api/salary-structures/:id/rules` | Bearer | `PAYROLL_MANAGER_PLUS` | `{ code, name, category, sequence, computeMethod, amount?, baseCode?, formula? }` | `{ statusCode: 201, data: SalaryRule }` |
| `PATCH` | `/api/salary-structures/:id/rules/:ruleId` | Bearer | `PAYROLL_MANAGER_PLUS` | Partial rule object | `{ statusCode: 200, data: SalaryRule }` |
| `DELETE` | `/api/salary-structures/:id/rules/:ruleId` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, message: string }` |

---

## 8. Payruns (`/api/payruns`)
| Method | Path | Auth | Roles | Request Body | Response Shape |
|---|---|---|---|---|---|
| `POST` | `/api/payruns/draft` | Bearer | `PAYROLL_USER_PLUS` | `{ salaryStructureId, periodStart, periodEnd }` | `{ statusCode: 200, data: { eligibleEmployees: [...], periodStart, periodEnd, totalEligible } }` |
| `POST` | `/api/payruns` | Bearer | `PAYROLL_USER_PLUS` | `{ name, salaryStructureId, periodStart, periodEnd, employeeIds: [...] }` | `{ statusCode: 201, data: Payrun }` |
| `GET` | `/api/payruns` | Bearer | `PAYROLL_USER_PLUS` | `?status=&salaryStructureId=` | `{ statusCode: 200, data: Payrun[] }` |
| `GET` | `/api/payruns/:id` | Bearer | `PAYROLL_USER_PLUS` | None | `{ statusCode: 200, data: Payrun }` (includes payslips, structure) |
| `POST` | `/api/payruns/:id/compute` | Bearer | `PAYROLL_USER_PLUS` | None | `{ statusCode: 200, data: Payrun }` (computes payslip lines) |
| `PATCH` | `/api/payruns/:id/validate` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, data: Payrun }` (sets status to VALIDATED) |
| `PATCH` | `/api/payruns/:id/mark-paid` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, data: Payrun }` (sets status to PAID) |
| `POST` | `/api/payruns/:id/send` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, data: { sentCount, message } }` |
| `DELETE` | `/api/payruns/:id` | Bearer | `PAYROLL_MANAGER_PLUS` | None | `{ statusCode: 200, message: string }` |

---

## 9. Payslips (`/api/payslips`)
| Method | Path | Auth | Roles | Request Body | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/payslips/my` | Bearer | Any Employee | None | `{ statusCode: 200, data: Payslip[] }` |
| `GET` | `/api/payslips/:id` | Bearer | Any (scoped) | None | `{ statusCode: 200, data: Payslip }` (includes lines, employee, contract) |
| `GET` | `/api/payslips/:id/pdf` | Bearer | Any (scoped) | None | Binary PDF Stream (`application/pdf`) |

---

## 10. Dashboard (`/api/dashboard`)
| Method | Path | Auth | Roles | Query Params | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/api/dashboard/kpis` | Bearer | `HR_MANAGER_PLUS` | `?department=` | `{ statusCode: 200, data: { totalNetSalaryPaid, totalPayslipsGenerated, averageSalary, activeEmployees, approvedTimeOffDays, attendanceHealthPercentage } }` |
| `GET` | `/api/dashboard/salary-cost-by-department` | Bearer | `HR_MANAGER_PLUS` | None | `{ statusCode: 200, data: Array<{ department, totalCost, employeeCount }> }` |
| `GET` | `/api/dashboard/monthly-net-trend` | Bearer | `HR_MANAGER_PLUS` | None | `{ statusCode: 200, data: Array<{ month, netSalaryPaid, totalGross }> }` |
| `GET` | `/api/dashboard/attendance-overview` | Bearer | `HR_MANAGER_PLUS` | None | `{ statusCode: 200, data: { present, late, absent, exceptions, corrected, total } }` |
| `GET` | `/api/dashboard/alerts` | Bearer | `HR_MANAGER_PLUS` | None | `{ statusCode: 200, data: { payrollWarnings: [...], expiringContracts: [...] } }` |

---

## Reconciled Notes & Gaps (per Step 0 Prompt instructions)
1. **Response shape normalization**: Older modules return raw arrays/objects (`Employee[]`, `Contract[]`, etc.), whereas newer modules return `{ statusCode, data }`. The frontend service layer normalizes both transparently (`res.data?.data ?? res.data`).
2. **User management**: Handled via `POST /api/auth/register`. A user service stub with `// TODO: backend route pending verification` backs the admin user management screen.
3. **Departments**: In the Prisma model, department is a string field on Employee and Contract. The frontend aggregates departments and headcount dynamically.
