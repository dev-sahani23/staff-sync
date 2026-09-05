# 📋 PeoplePay360 Backend: Kanban Board

---

# 👨‍💻 Developer 1: Core HR & Master Data
**Branch:** `feature/dev1-core-hr`

| 📋 Backlog / To Do | ⏳ In Progress | 🧪 In Review / Testing | ✅ Done |
| :--- | :--- | :--- | :--- |
| • **Task 1.2**: Working Schedule CRUD + nested `ScheduleLine[]`<br>• **Task 1.2**: Dynamic `calculateWeeklyHours()` computed property<br>• **Task 1.3**: Employee Master CRUD + Kanban & List filters<br>• **Task 1.3**: Smart Buttons (`/contracts`, `/attendance`, `/timeoff`, `/allocations`)<br>• **Task 1.4**: Contract Overlap Validator (`assertNoOverlappingActiveContract`)<br>• **Task 1.4**: Contract Lookup Helper (`GET /contracts/lookup`)<br>• **Task 1.4**: Contract Status Transition (`PATCH /contracts/:id/activate`)<br>• **Task 1.5**: Attendance Check-In/Out & Worked Hours calculation<br>• **Task 1.5**: Attendance Manual Correction & Exception Auto-Detection<br>• **Task 1.6**: Time Off Type CRUD & Allocations (`remaining = allocated - taken`)<br>• **Task 1.6**: Leave Request Approval with DB Transaction | • **Task 1.1**: Auth Module (`/auth/register`, `/auth/login`, bcrypt password hashing)<br>• **Task 1.1**: Global `authenticateJWT` & `authorizeRoles` middlewares | • Fixing import extensions and parameter types | • Base Express setup & initial skeleton routes |

---

# 👩‍💻 Developer 2: Payroll Engine & Analytics
**Branch:** `feature/dev2-payroll-engine`

| 📋 Backlog / To Do | ⏳ In Progress | 🧪 In Review / Testing | ✅ Done |
| :--- | :--- | :--- | :--- |
| *(All Tasks Completed!)* | | | • **Task 01**: Prisma Models for `SalaryStructure` & `SalaryRule`<br>• **Task 02**: Zod validation schemas for Structures & Rules<br>• **Task 03**: `SalaryStructureService` & Controller CRUD<br>• **Task 04**: Nested Salary Rule CRUD with sequence uniqueness<br>• **Task 05**: Mathjs Formula Evaluator (sandboxed AST, no `eval`)<br>• **Task 06**: Core `SalaryEngineService` (Gross, Net, Deductions)<br>• **Task 07**: Unit Test Suite (18/18 Passed)<br>• **Task 08**: Payrun, Payslip, PayslipLine DB Models<br>• **Task 09**: Payrun Wizard Step 1 (`POST /api/payruns/draft`)<br>• **Task 10**: Payrun Wizard Step 2 (`POST /api/payruns`)<br>• **Task 11**: Payrun Batch Compute (`POST /api/payruns/:id/compute`)<br>• **Task 12**: Payroll Warnings Engine (missing bank, duplicate slip, no contract)<br>• **Task 13**: Payrun Status Workflow (`/validate` & `/mark-paid`)<br>• **Task 14**: Responsive HTML Payslip Template<br>• **Task 15**: Puppeteer PDF Generator (`GET /api/payslips/:id/pdf`)<br>• **Task 16**: Nodemailer Email Service configuration<br>• **Task 17**: Bulk Async Email Dispatcher (`POST /api/payruns/:id/send`)<br>• **Task 18**: Unified Query Filter Handler (`?period=&department=`)<br>• **Task 19**: Dashboard Aggregations (KPIs, Costs, Trends, Alerts)<br>• **Task 20**: Swagger OpenAPI 3.0 Documentation at `/api/docs` |
