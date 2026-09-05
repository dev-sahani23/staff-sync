# 🧪 Developer 2: End-to-End Payroll Engine Testing Guide (0 to 100)

Follow this step-by-step testing guide to verify every single feature of the **PeoplePay360 Payroll Engine** from start to finish.

---

## 🛠️ Stage 1: Setup Database & Seed Data (0% ➔ 20%)

### 1.1 Configure Environment
Open `backend/.env` and ensure your PostgreSQL database URL is correct:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/peoplepay360?schema=public"
JWT_SECRET="peoplepay360_super_secret_jwt_key_2026"
```

### 1.2 Sync Database Schema
Run Prisma to create all tables in PostgreSQL:
```bash
cd backend
npx prisma db push
```

### 1.3 Seed Realistic Demo Data
Run our automated seed script to populate demo employees, active contracts, attendance records, salary structures, and users:
```bash
npm run seed
```

> **🔑 Seeded Test Accounts:**
> - **Admin**: `admin@peoplepay.com` / `password123`
> - **Payroll Manager**: `payroll.manager@peoplepay.com` / `password123`
> - **Employee**: `rahul.sharma@peoplepay.com` / `password123`

---

## 🧮 Stage 2: Verify Pure Salary Calculation Engine (20% ➔ 40%)

Run the mathematical unit test suite to verify 100% precision:
```bash
npm run test:engine
```
**Expected Result:**
```text
  ✅ [PASS] Basic Salary is 50% of Wage (30,000)
  ✅ [PASS] HRA is 40% of Basic (12,000)
  ✅ [PASS] Conveyance is Fixed 3,000
  ✅ [PASS] Special Allowance formula evaluates to 15,000
  ✅ [PASS] PF is 12% of Basic (3,600)
  ✅ [PASS] Professional Tax is 200
  ✅ [PASS] Gross Total is 60,000
  ✅ [PASS] Net Total matches 56,200
  ...
📊 Test Summary: 18/18 tests passed.
🎉 ALL SALARY ENGINE TESTS PASSED PERFECTLY!
```

---

## 🚀 Stage 3: Start Dev Server & Open Swagger (40% ➔ 50%)

Start the Express backend:
```bash
npm run dev
```
Open your browser and navigate to:
👉 **`http://localhost:5000/api/docs`**

You will see the interactive Swagger UI covering all endpoints!

---

## 🧪 Stage 4: End-to-End API Flow via Swagger / Postman (50% ➔ 85%)

### Step 4.1: Login to get JWT Token
- **Request**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "payroll.manager@peoplepay.com",
    "password": "password123"
  }
  ```
- **Copy the `accessToken`** from the response.
- In Swagger, click **Authorize** at the top right, paste the token, and click **Authorize**.

---

### Step 4.2: Inspect Seeded Salary Structure & Rules
- **Request**: `GET /api/salary-structures`
- **Response**: Shows the active structure with its 7 configured rules (`BASIC`, `HRA`, `CONVEYANCE`, `SPECIAL`, `PF`, `PROF_TAX`, `NET`).

---

### Step 4.3: Test Payrun Wizard Step 1 (Draft Scope Preview)
- **Request**: `POST /api/payruns/draft`
- **Body**:
  ```json
  {
    "salaryStructureId": "<STRUCTURE_ID_FROM_STEP_4.2>",
    "periodStart": "2026-09-01",
    "periodEnd": "2026-09-30"
  }
  ```
- **Verification**: Verify that `totalEligibleCount: 3` is returned with `Rahul Sharma`, `Priya Verma`, and `Amit Patel`.

---

### Step 4.4: Test Payrun Wizard Step 2 (Create Batch)
- **Request**: `POST /api/payruns`
- **Body**:
  ```json
  {
    "name": "September 2026 Payroll",
    "salaryStructureId": "<STRUCTURE_ID>",
    "periodStart": "2026-09-01",
    "periodEnd": "2026-09-30",
    "employeeIds": ["<EMPLOYEE_ID_1>", "<EMPLOYEE_ID_2>", "<EMPLOYEE_ID_3>"]
  }
  ```
- **Verification**: Payrun is created with `status: "DRAFT"`. Copy the `payrun.id`.

---

### Step 4.5: Test Batch Compute & Warnings Engine
- **Request**: `POST /api/payruns/<PAYRUN_ID>/compute`
- **Verification**:
  - `Payrun.status` transitions to `"COMPUTED"`.
  - Itemized `PayslipLine` records are computed for each employee.
  - **Warnings Detection**: Notice that `Amit Patel` receives `warnings: ["MISSING_BANK_DETAILS"]` because bank info was intentionally omitted in seed data!

---

### Step 4.6: Test Status Workflow (Validate & Mark-Paid)
1. **Validate**:
   - `PATCH /api/payruns/<PAYRUN_ID>/validate`
   - Status updates to `"VALIDATED"`.
2. **Mark as Paid**:
   - `PATCH /api/payruns/<PAYRUN_ID>/mark-paid`
   - Status updates to `"PAID"`. Payslips are now locked.

---

### Step 4.7: Test Payslip PDF Generation Stream
- Copy any `payslip.id` from the computed payrun.
- In your browser (or Postman), open:
  👉 **`http://localhost:5000/api/payslips/<PAYSLIP_ID>/pdf`**
- **Verification**: A pixel-perfect PDF payslip will render/download showing the company header, employee details, worked days, itemized earnings & deductions table, and Gross/Net salary totals!

---

### Step 4.8: Test Bulk Email Dispatch
- **Request**: `POST /api/payruns/<PAYRUN_ID>/send`
- **Response**: Immediate `202 Accepted` (`"Payslip email dispatch initiated in background"`).

---

### Step 4.9: Test Dashboard Aggregation APIs
Call each aggregation endpoint with or without filters:
1. `GET /api/dashboard/kpis` $\rightarrow$ Live cards (Total Net Paid, Payslips Generated, Avg Salary, Attendance Health).
2. `GET /api/dashboard/salary-cost-by-department` $\rightarrow$ Grouped by Engineering, Design, HR.
3. `GET /api/dashboard/monthly-net-trend` $\rightarrow$ Monthly net payouts.
4. `GET /api/dashboard/attendance-overview` $\rightarrow$ Present, Late, Absent summary.
5. `GET /api/dashboard/alerts` $\rightarrow$ Unresolved payroll warnings & contract alerts.

---

## 🛡️ Stage 5: RBAC & Scope Protection Testing (85% ➔ 100%)

1. **Login as Employee**:
   - `POST /api/auth/login` with `rahul.sharma@peoplepay.com` / `password123`.
2. **Test Restricted Access**:
   - Try `POST /api/salary-structures` $\rightarrow$ Should return `403 Forbidden: Insufficient privileges`.
   - Try `POST /api/payruns/draft` $\rightarrow$ Should return `403 Forbidden`.
3. **Test Self-Service Payslips**:
   - `GET /api/payslips/my` $\rightarrow$ Returns only Rahul Sharma's payslips.
   - `GET /api/payslips/<PRIYA_PAYSLIP_ID>` $\rightarrow$ Returns `403 Forbidden: You can only view your own payslips`.
