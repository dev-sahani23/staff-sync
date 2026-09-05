BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('EMPLOYEE','HR_MANAGER','HR_PAYROLL_USER','HR_PAYROLL_MANAGER','ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE employee_status AS ENUM ('ACTIVE','INACTIVE','ON_LEAVE','TERMINATED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE employee_type AS ENUM ('FULL_TIME','PART_TIME','CONTRACT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM ('DRAFT','ACTIVE','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('NORMAL','EXCEPTION','CORRECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE time_off_unit AS ENUM ('DAYS','HOURS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('DRAFT','PENDING','APPROVED','REFUSED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE allocation_status AS ENUM ('DRAFT','APPROVED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE rule_category AS ENUM ('BASIC','ALLOWANCE','DEDUCTION','GROSS','NET');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE compute_method AS ENUM ('FIXED','PERCENTAGE','FORMULA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payrun_status AS ENUM ('DRAFT','COMPUTED','VALIDATED','PAID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payslip_status AS ENUM ('DRAFT','COMPUTED','VALIDATED','PAID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. USER & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    "employeeId" UUID UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. EMPLOYEE MASTER
-- ============================================================

CREATE TABLE IF NOT EXISTS "Employee" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    "jobPosition" VARCHAR(150),
    department VARCHAR(150),
    status employee_status NOT NULL DEFAULT 'ACTIVE',
    "managerId" UUID REFERENCES "Employee"(id) ON DELETE SET NULL,
    "scheduleId" UUID,
    "employeeType" employee_type NOT NULL DEFAULT 'FULL_TIME',
    "joinDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "bankName" VARCHAR(150),
    "accountNumber" VARCHAR(100),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT employee_not_own_manager CHECK ("managerId" IS NULL OR "managerId" <> id)
);

-- ============================================================
-- 3. WORKING SCHEDULES
-- ============================================================

CREATE TABLE IF NOT EXISTS "WorkingSchedule" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'WEEKLY',
    "weeklyHours" NUMERIC(6,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT schedule_weekly_hours_check CHECK ("weeklyHours" >= 0 AND "weeklyHours" <= 168)
);

CREATE TABLE IF NOT EXISTS "ScheduleLine" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "scheduleId" UUID NOT NULL REFERENCES "WorkingSchedule"(id) ON DELETE CASCADE,
    "dayOfWeek" SMALLINT NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT schedule_line_day_check CHECK ("dayOfWeek" BETWEEN 0 AND 6),
    CONSTRAINT schedule_line_time_check CHECK ("endTime" > "startTime"),
    CONSTRAINT schedule_line_break_check CHECK ("breakMinutes" >= 0 AND "breakMinutes" <= 1440),
    CONSTRAINT schedule_line_unique_day UNIQUE ("scheduleId", "dayOfWeek")
);

ALTER TABLE "Employee"
    ADD CONSTRAINT employee_schedule_fk
    FOREIGN KEY ("scheduleId") REFERENCES "WorkingSchedule"(id) ON DELETE SET NULL;

-- ============================================================
-- 4. SALARY STRUCTURES & RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS "SalaryStructure" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SalaryRule" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "salaryStructureId" UUID NOT NULL REFERENCES "SalaryStructure"(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category rule_category NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 1,
    "computeMethod" compute_method NOT NULL,
    amount NUMERIC(14,4),
    "baseCode" VARCHAR(50),
    formula TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT salary_rule_sequence_check CHECK (sequence >= 1),
    CONSTRAINT salary_rule_amount_check CHECK (amount IS NULL OR amount >= 0),
    CONSTRAINT salary_rule_unique_code UNIQUE ("salaryStructureId", code),
    CONSTRAINT salary_rule_compute_data_check CHECK (
        ("computeMethod" = 'FIXED' AND amount IS NOT NULL AND formula IS NULL)
        OR
        ("computeMethod" = 'PERCENTAGE' AND amount IS NOT NULL AND "baseCode" IS NOT NULL AND formula IS NULL)
        OR
        ("computeMethod" = 'FORMULA' AND formula IS NOT NULL AND length(trim(formula)) > 0)
    )
);

-- ============================================================
-- 5. CONTRACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS "Contract" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL REFERENCES "Employee"(id) ON DELETE CASCADE,
    "salaryStructureId" UUID NOT NULL REFERENCES "SalaryStructure"(id) ON DELETE RESTRICT,
    wage NUMERIC(14,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    status contract_status NOT NULL DEFAULT 'DRAFT',
    department VARCHAR(150),
    "jobPosition" VARCHAR(150),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contract_wage_check CHECK (wage >= 0),
    CONSTRAINT contract_date_check CHECK ("endDate" IS NULL OR "endDate" >= "startDate")
);

ALTER TABLE "Contract"
    ADD COLUMN IF NOT EXISTS contract_period DATERANGE
    GENERATED ALWAYS AS (
        daterange("startDate", COALESCE("endDate" + 1, 'infinity'::date), '[)')
    ) STORED;

ALTER TABLE "Contract"
    DROP CONSTRAINT IF EXISTS no_overlapping_active_contracts;

ALTER TABLE "Contract"
    ADD CONSTRAINT no_overlapping_active_contracts
    EXCLUDE USING gist (
        "employeeId" WITH =,
        contract_period WITH &&
    )
    WHERE (status = 'ACTIVE');

-- ============================================================
-- 6. ATTENDANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS "Attendance" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL REFERENCES "Employee"(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    "checkIn" TIMESTAMPTZ NOT NULL,
    "checkOut" TIMESTAMPTZ,
    "workedHours" NUMERIC(8,2) NOT NULL DEFAULT 0,
    status attendance_status NOT NULL DEFAULT 'NORMAL',
    "correctedBy" UUID REFERENCES "Employee"(id) ON DELETE SET NULL,
    "correctionNotes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT attendance_checkout_check CHECK ("checkOut" IS NULL OR "checkOut" >= "checkIn"),
    CONSTRAINT attendance_worked_hours_check CHECK ("workedHours" >= 0),
    CONSTRAINT attendance_employee_date_unique UNIQUE ("employeeId", date)
);

-- ============================================================
-- 7. TIME OFF
-- ============================================================

CREATE TABLE IF NOT EXISTS "TimeOffType" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    unit time_off_unit NOT NULL DEFAULT 'DAYS',
    "requiresAllocation" BOOLEAN NOT NULL DEFAULT TRUE,
    "payrollIntegrated" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LeaveAllocation" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL REFERENCES "Employee"(id) ON DELETE CASCADE,
    "timeOffTypeId" UUID NOT NULL REFERENCES "TimeOffType"(id) ON DELETE RESTRICT,
    allocated NUMERIC(10,2) NOT NULL DEFAULT 0,
    taken NUMERIC(10,2) NOT NULL DEFAULT 0,
    "validFrom" DATE NOT NULL,
    "validTo" DATE NOT NULL,
    status allocation_status NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT allocation_amount_check CHECK (allocated >= 0 AND taken >= 0 AND taken <= allocated),
    CONSTRAINT allocation_date_check CHECK ("validTo" >= "validFrom")
);

CREATE TABLE IF NOT EXISTS "LeaveRequest" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL REFERENCES "Employee"(id) ON DELETE CASCADE,
    "timeOffTypeId" UUID NOT NULL REFERENCES "TimeOffType"(id) ON DELETE RESTRICT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    duration NUMERIC(10,2) NOT NULL,
    status request_status NOT NULL DEFAULT 'DRAFT',
    reason TEXT,
    "approvedBy" UUID REFERENCES "Employee"(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT leave_request_date_check CHECK ("endDate" >= "startDate"),
    CONSTRAINT leave_request_duration_check CHECK (duration > 0)
);

-- ============================================================
-- 8. PAYRUN & PAYSLIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS "Payrun" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    "salaryStructureId" UUID NOT NULL REFERENCES "SalaryStructure"(id) ON DELETE RESTRICT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    status payrun_status NOT NULL DEFAULT 'DRAFT',
    "totalGross" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "totalNet" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payrun_period_check CHECK ("periodEnd" >= "periodStart"),
    CONSTRAINT payrun_totals_check CHECK ("totalGross" >= 0 AND "totalNet" >= 0)
);

CREATE TABLE IF NOT EXISTS "Payslip" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payrunId" UUID NOT NULL REFERENCES "Payrun"(id) ON DELETE CASCADE,
    "employeeId" UUID NOT NULL REFERENCES "Employee"(id) ON DELETE RESTRICT,
    "contractId" UUID NOT NULL REFERENCES "Contract"(id) ON DELETE RESTRICT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "workedDays" NUMERIC(8,2) NOT NULL DEFAULT 0,
    "grossTotal" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "netTotal" NUMERIC(16,2) NOT NULL DEFAULT 0,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    status payslip_status NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payslip_period_check CHECK ("periodEnd" >= "periodStart"),
    CONSTRAINT payslip_worked_days_check CHECK ("workedDays" >= 0),
    CONSTRAINT payslip_totals_check CHECK ("grossTotal" >= 0 AND "netTotal" >= 0),
    CONSTRAINT payslip_unique_employee_per_payrun UNIQUE ("payrunId", "employeeId")
);

CREATE TABLE IF NOT EXISTS "PayslipLine" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payslipId" UUID NOT NULL REFERENCES "Payslip"(id) ON DELETE CASCADE,
    "salaryRuleId" UUID NOT NULL REFERENCES "SalaryRule"(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category rule_category NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 1,
    amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payslip_line_sequence_check CHECK (sequence >= 1)
);

-- ============================================================
-- 9. USER -> EMPLOYEE FK (added after Employee exists)
-- ============================================================

ALTER TABLE "User"
    ADD CONSTRAINT user_employee_fk
    FOREIGN KEY ("employeeId") REFERENCES "Employee"(id) ON DELETE SET NULL;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_updated_at ON "User";
CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_employee_updated_at ON "Employee";
CREATE TRIGGER trg_employee_updated_at BEFORE UPDATE ON "Employee"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_schedule_updated_at ON "WorkingSchedule";
CREATE TRIGGER trg_schedule_updated_at BEFORE UPDATE ON "WorkingSchedule"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_contract_updated_at ON "Contract";
CREATE TRIGGER trg_contract_updated_at BEFORE UPDATE ON "Contract"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_updated_at ON "Attendance";
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON "Attendance"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_timeoff_type_updated_at ON "TimeOffType";
CREATE TRIGGER trg_timeoff_type_updated_at BEFORE UPDATE ON "TimeOffType"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_allocation_updated_at ON "LeaveAllocation";
CREATE TRIGGER trg_allocation_updated_at BEFORE UPDATE ON "LeaveAllocation"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leave_request_updated_at ON "LeaveRequest";
CREATE TRIGGER trg_leave_request_updated_at BEFORE UPDATE ON "LeaveRequest"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_salary_structure_updated_at ON "SalaryStructure";
CREATE TRIGGER trg_salary_structure_updated_at BEFORE UPDATE ON "SalaryStructure"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_salary_rule_updated_at ON "SalaryRule";
CREATE TRIGGER trg_salary_rule_updated_at BEFORE UPDATE ON "SalaryRule"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payrun_updated_at ON "Payrun";
CREATE TRIGGER trg_payrun_updated_at BEFORE UPDATE ON "Payrun"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payslip_updated_at ON "Payslip";
CREATE TRIGGER trg_payslip_updated_at BEFORE UPDATE ON "Payslip"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attendance worked hours = checkout - checkin.
CREATE OR REPLACE FUNCTION calculate_attendance_worked_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."checkOut" IS NOT NULL THEN
        NEW."workedHours" = ROUND((EXTRACT(EPOCH FROM (NEW."checkOut" - NEW."checkIn")) / 3600.0)::NUMERIC, 2);
    ELSE
        NEW."workedHours" = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attendance_worked_hours ON "Attendance";
CREATE TRIGGER trg_attendance_worked_hours
BEFORE INSERT OR UPDATE OF "checkIn", "checkOut" ON "Attendance"
FOR EACH ROW EXECUTE FUNCTION calculate_attendance_worked_hours();

-- Recalculate weekly schedule hours automatically.
CREATE OR REPLACE FUNCTION recalculate_schedule_weekly_hours(p_schedule_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE "WorkingSchedule" ws
    SET "weeklyHours" = COALESCE((
        SELECT SUM(
            GREATEST(
                EXTRACT(EPOCH FROM (sl."endTime" - sl."startTime")) / 3600.0
                - (sl."breakMinutes" / 60.0),
                0
            )
        )
        FROM "ScheduleLine" sl
        WHERE sl."scheduleId" = p_schedule_id
    ), 0)
    WHERE ws.id = p_schedule_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION schedule_line_weekly_hours_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_schedule_weekly_hours(OLD."scheduleId");
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM recalculate_schedule_weekly_hours(OLD."scheduleId");
        PERFORM recalculate_schedule_weekly_hours(NEW."scheduleId");
        RETURN NEW;
    ELSE
        PERFORM recalculate_schedule_weekly_hours(NEW."scheduleId");
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schedule_line_weekly_hours ON "ScheduleLine";
CREATE TRIGGER trg_schedule_line_weekly_hours
AFTER INSERT OR UPDATE OR DELETE ON "ScheduleLine"
FOR EACH ROW EXECUTE FUNCTION schedule_line_weekly_hours_trigger();

-- Ensure a payslip contract belongs to its employee and covers the period.
CREATE OR REPLACE FUNCTION validate_payslip_contract()
RETURNS TRIGGER AS $$
DECLARE
    c_employee UUID;
    c_start DATE;
    c_end DATE;
BEGIN
    SELECT "employeeId", "startDate", "endDate"
    INTO c_employee, c_start, c_end
    FROM "Contract"
    WHERE id = NEW."contractId";

    IF c_employee IS NULL THEN
        RAISE EXCEPTION 'Payslip contract does not exist: %', NEW."contractId";
    END IF;

    IF c_employee <> NEW."employeeId" THEN
        RAISE EXCEPTION 'Payslip employee and contract employee do not match';
    END IF;

    IF c_start > NEW."periodEnd"
       OR (c_end IS NOT NULL AND c_end < NEW."periodStart") THEN
        RAISE EXCEPTION 'Contract does not apply to the payslip period';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_payslip_contract ON "Payslip";
CREATE TRIGGER trg_validate_payslip_contract
BEFORE INSERT OR UPDATE OF "employeeId", "contractId", "periodStart", "periodEnd"
ON "Payslip"
FOR EACH ROW EXECUTE FUNCTION validate_payslip_contract();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_user_active ON "User"("isActive");
CREATE INDEX IF NOT EXISTS idx_employee_department ON "Employee"(department);
CREATE INDEX IF NOT EXISTS idx_employee_manager ON "Employee"("managerId");
CREATE INDEX IF NOT EXISTS idx_employee_schedule ON "Employee"("scheduleId");
CREATE INDEX IF NOT EXISTS idx_employee_status ON "Employee"(status);
CREATE INDEX IF NOT EXISTS idx_contract_employee ON "Contract"("employeeId");
CREATE INDEX IF NOT EXISTS idx_contract_status ON "Contract"(status);
CREATE INDEX IF NOT EXISTS idx_contract_dates ON "Contract"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON "Attendance"("employeeId", date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON "Attendance"(status);
CREATE INDEX IF NOT EXISTS idx_allocation_employee_type ON "LeaveAllocation"("employeeId", "timeOffTypeId");
CREATE INDEX IF NOT EXISTS idx_leave_request_employee ON "LeaveRequest"("employeeId");
CREATE INDEX IF NOT EXISTS idx_leave_request_status ON "LeaveRequest"(status);
CREATE INDEX IF NOT EXISTS idx_salary_rule_structure_sequence ON "SalaryRule"("salaryStructureId", sequence);
CREATE INDEX IF NOT EXISTS idx_payrun_period ON "Payrun"("periodStart", "periodEnd");
CREATE INDEX IF NOT EXISTS idx_payrun_status ON "Payrun"(status);
CREATE INDEX IF NOT EXISTS idx_payslip_payrun ON "Payslip"("payrunId");
CREATE INDEX IF NOT EXISTS idx_payslip_employee ON "Payslip"("employeeId");
CREATE INDEX IF NOT EXISTS idx_payslip_status ON "Payslip"(status);
CREATE INDEX IF NOT EXISTS idx_payslip_line_rule ON "PayslipLine"("salaryRuleId");

-- ============================================================
-- DASHBOARD VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_employee_leave_balance AS
SELECT
    e.id AS "employeeId",
    e."firstName",
    e."lastName",
    t.id AS "timeOffTypeId",
    t.name AS "timeOffType",
    t.unit,
    COALESCE(SUM(CASE WHEN a.status = 'APPROVED' THEN a.allocated ELSE 0 END), 0) AS allocated,
    COALESCE(SUM(CASE WHEN a.status = 'APPROVED' THEN a.taken ELSE 0 END), 0) AS taken,
    COALESCE(SUM(CASE WHEN a.status = 'APPROVED' THEN a.allocated - a.taken ELSE 0 END), 0) AS remaining
FROM "Employee" e
CROSS JOIN "TimeOffType" t
LEFT JOIN "LeaveAllocation" a
    ON a."employeeId" = e.id
   AND a."timeOffTypeId" = t.id
   AND CURRENT_DATE BETWEEN a."validFrom" AND a."validTo"
GROUP BY e.id, e."firstName", e."lastName", t.id, t.name, t.unit;

CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
    pr.id AS "payrunId",
    pr.name AS "payrunName",
    pr."periodStart",
    pr."periodEnd",
    pr.status,
    COUNT(ps.id) AS "payslipCount",
    COALESCE(SUM(ps."grossTotal"), 0) AS "totalGross",
    COALESCE(SUM(ps."netTotal"), 0) AS "totalNet"
FROM "Payrun" pr
LEFT JOIN "Payslip" ps ON ps."payrunId" = pr.id
GROUP BY pr.id, pr.name, pr."periodStart", pr."periodEnd", pr.status;

CREATE OR REPLACE VIEW v_department_payroll AS
SELECT
    e.department,
    COUNT(DISTINCT e.id) AS "employeeCount",
    COUNT(ps.id) AS "payslipCount",
    COALESCE(SUM(ps."grossTotal"), 0) AS "totalGross",
    COALESCE(SUM(ps."netTotal"), 0) AS "totalNet"
FROM "Employee" e
LEFT JOIN "Payslip" ps ON ps."employeeId" = e.id
GROUP BY e.department;

CREATE OR REPLACE VIEW v_attendance_overview AS
SELECT
    e.id AS "employeeId",
    e."firstName",
    e."lastName",
    e.department,
    COUNT(a.id) AS "attendanceDays",
    COALESCE(SUM(a."workedHours"), 0) AS "workedHours",
    COUNT(*) FILTER (WHERE a.status = 'EXCEPTION') AS "exceptionCount",
    COUNT(*) FILTER (WHERE a.status = 'CORRECTED') AS "correctedCount"
FROM "Employee" e
LEFT JOIN "Attendance" a ON a."employeeId" = e.id
GROUP BY e.id, e."firstName", e."lastName", e.department;

CREATE OR REPLACE VIEW v_time_off_overview AS
SELECT
    e.id AS "employeeId",
    e."firstName",
    e."lastName",
    e.department,
    COUNT(lr.id) FILTER (WHERE lr.status = 'PENDING') AS "pendingRequests",
    COUNT(lr.id) FILTER (WHERE lr.status = 'APPROVED') AS "approvedRequests",
    COALESCE(SUM(lr.duration) FILTER (WHERE lr.status = 'APPROVED'), 0) AS "approvedDuration"
FROM "Employee" e
LEFT JOIN "LeaveRequest" lr ON lr."employeeId" = e.id
GROUP BY e.id, e."firstName", e."lastName", e.department;

-- ============================================================
-- DEMO / SEED DATA
-- ============================================================

INSERT INTO "WorkingSchedule" (name, type)
VALUES ('Standard 5 Day', 'WEEKLY')
ON CONFLICT (name) DO NOTHING;

INSERT INTO "ScheduleLine" ("scheduleId", "dayOfWeek", "startTime", "endTime", "breakMinutes")
SELECT ws.id, v.day_no, v.start_time::time, v.end_time::time, 60
FROM "WorkingSchedule" ws
CROSS JOIN (VALUES
    (0,'09:00','18:00'),
    (1,'09:00','18:00'),
    (2,'09:00','18:00'),
    (3,'09:00','18:00'),
    (4,'09:00','18:00')
) AS v(day_no,start_time,end_time)
WHERE ws.name = 'Standard 5 Day'
ON CONFLICT ("scheduleId", "dayOfWeek") DO NOTHING;

INSERT INTO "SalaryStructure" (name, code, "isActive")
VALUES ('Regular Salary', 'REGULAR', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO "SalaryRule"
("salaryStructureId", name, code, category, sequence, "computeMethod", amount, "baseCode", formula)
SELECT ss.id, x.name, x.code, x.category::rule_category, x.sequence,
       x.compute_method::compute_method, x.amount, x.base_code, x.formula
FROM "SalaryStructure" ss
CROSS JOIN (VALUES
    ('Basic Salary','BASIC','BASIC',10,'FIXED',50000.00::numeric,NULL::varchar,NULL::text),
    ('House Rent Allowance','HRA','ALLOWANCE',20,'PERCENTAGE',40.00::numeric,'BASIC'::varchar,NULL::text),
    ('Gross Salary','GROSS','GROSS',30,'FORMULA',NULL::numeric,NULL::varchar,'BASIC + HRA'::text),
    ('Provident Fund','PF','DEDUCTION',40,'PERCENTAGE',12.00::numeric,'BASIC'::varchar,NULL::text),
    ('Net Salary','NET','NET',50,'FORMULA',NULL::numeric,NULL::varchar,'GROSS - PF'::text)
) AS x(name,code,category,sequence,compute_method,amount,base_code,formula)
WHERE ss.code = 'REGULAR'
ON CONFLICT ("salaryStructureId", code) DO NOTHING;

INSERT INTO "TimeOffType" (name, unit, "requiresAllocation", "payrollIntegrated")
VALUES
    ('Paid Leave','DAYS',TRUE,TRUE),
    ('Sick Leave','DAYS',TRUE,TRUE),
    ('Unpaid Leave','DAYS',FALSE,FALSE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO "Employee"
("firstName","lastName",email,phone,"jobPosition",department,status,"employeeType","joinDate","bankName","accountNumber","scheduleId")
SELECT 'Aarav','Sharma','aarav@peoplepay360.com','+91-9000000001','Software Engineer','Engineering','ACTIVE','FULL_TIME','2025-01-10','Demo Bank','DEMO001',ws.id
FROM "WorkingSchedule" ws
WHERE ws.name='Standard 5 Day'
  AND NOT EXISTS (SELECT 1 FROM "Employee" WHERE email='aarav@peoplepay360.com');

INSERT INTO "Employee"
("firstName","lastName",email,phone,"jobPosition",department,status,"employeeType","joinDate","bankName","accountNumber","scheduleId")
SELECT 'Ananya','Patel','ananya@peoplepay360.com','+91-9000000002','HR Executive','Human Resources','ACTIVE','FULL_TIME','2025-02-15','Demo Bank','DEMO002',ws.id
FROM "WorkingSchedule" ws
WHERE ws.name='Standard 5 Day'
  AND NOT EXISTS (SELECT 1 FROM "Employee" WHERE email='ananya@peoplepay360.com');

UPDATE "Employee"
SET "managerId" = (SELECT id FROM "Employee" WHERE email='aarav@peoplepay360.com')
WHERE email='ananya@peoplepay360.com';

-- Demo users. Password hash is a placeholder; backend should replace it
-- with the real bcrypt/argon2 hash used by the authentication service.
INSERT INTO "User" (email,"passwordHash",role,"employeeId","isActive")
VALUES ('admin@peoplepay360.com','$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH','ADMIN',NULL,TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO "User" (email,"passwordHash",role,"employeeId","isActive")
SELECT 'aarav@peoplepay360.com','$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH','EMPLOYEE',e.id,TRUE
FROM "Employee" e
WHERE e.email='aarav@peoplepay360.com'
  AND NOT EXISTS (SELECT 1 FROM "User" WHERE email='aarav@peoplepay360.com');

INSERT INTO "Contract"
("employeeId","salaryStructureId",wage,"startDate","endDate",status,department,"jobPosition")
SELECT e.id, ss.id, x.wage, x.start_date, NULL, 'ACTIVE', e.department, e."jobPosition"
FROM (VALUES
    ('aarav@peoplepay360.com',50000.00::numeric,DATE '2025-01-10'),
    ('ananya@peoplepay360.com',65000.00::numeric,DATE '2025-02-15')
) AS x(email,wage,start_date)
JOIN "Employee" e ON e.email=x.email
JOIN "SalaryStructure" ss ON ss.code='REGULAR'
WHERE NOT EXISTS (
    SELECT 1 FROM "Contract" c
    WHERE c."employeeId"=e.id AND c.status='ACTIVE'
);

INSERT INTO "LeaveAllocation"
("employeeId","timeOffTypeId",allocated,taken,"validFrom","validTo",status)
SELECT e.id,t.id,18,0,DATE '2026-01-01',DATE '2026-12-31','APPROVED'
FROM "Employee" e
JOIN "TimeOffType" t ON t.name='Paid Leave'
WHERE e.email IN ('aarav@peoplepay360.com','ananya@peoplepay360.com')
  AND NOT EXISTS (
      SELECT 1 FROM "LeaveAllocation" a
      WHERE a."employeeId"=e.id AND a."timeOffTypeId"=t.id AND a."validFrom"=DATE '2026-01-01'
  );

INSERT INTO "LeaveRequest"
("employeeId","timeOffTypeId","startDate","endDate",duration,status,reason,"approvedBy","approvedAt")
SELECT e.id,t.id,DATE '2026-08-10',DATE '2026-08-11',2,'APPROVED','Personal work',
       (SELECT id FROM "Employee" WHERE email='aarav@peoplepay360.com'),NOW()
FROM "Employee" e
JOIN "TimeOffType" t ON t.name='Paid Leave'
WHERE e.email='ananya@peoplepay360.com'
  AND NOT EXISTS (
      SELECT 1 FROM "LeaveRequest" lr
      WHERE lr."employeeId"=e.id AND lr."startDate"=DATE '2026-08-10'
  );

UPDATE "LeaveAllocation" a
SET taken=2
FROM "Employee" e,"TimeOffType" t
WHERE a."employeeId"=e.id
  AND a."timeOffTypeId"=t.id
  AND e.email='ananya@peoplepay360.com'
  AND t.name='Paid Leave'
  AND a."validFrom"=DATE '2026-01-01';

INSERT INTO "Attendance" ("employeeId",date,"checkIn","checkOut",status)
SELECT e.id,x.att_date,x.check_in,x.check_out,'NORMAL'
FROM "Employee" e
CROSS JOIN (VALUES
    (DATE '2026-09-01',TIMESTAMPTZ '2026-09-01 09:00:00+05:30',TIMESTAMPTZ '2026-09-01 18:00:00+05:30'),
    (DATE '2026-09-02',TIMESTAMPTZ '2026-09-02 09:10:00+05:30',TIMESTAMPTZ '2026-09-02 18:05:00+05:30'),
    (DATE '2026-09-03',TIMESTAMPTZ '2026-09-03 09:00:00+05:30',TIMESTAMPTZ '2026-09-03 17:30:00+05:30')
) AS x(att_date,check_in,check_out)
WHERE e.email='aarav@peoplepay360.com'
ON CONFLICT ("employeeId",date) DO NOTHING;

INSERT INTO "Payrun" (name,"salaryStructureId","periodStart","periodEnd",status)
SELECT 'September 2026 Payroll',ss.id,DATE '2026-09-01',DATE '2026-09-30','DRAFT'
FROM "SalaryStructure" ss
WHERE ss.code='REGULAR'
ON CONFLICT (name) DO NOTHING;

UPDATE "WorkingSchedule" ws
SET "weeklyHours"=COALESCE((
    SELECT SUM(
        GREATEST(
            EXTRACT(EPOCH FROM (sl."endTime"-sl."startTime"))/3600.0
            -(sl."breakMinutes"/60.0),0
        )
    )
    FROM "ScheduleLine" sl
    WHERE sl."scheduleId"=ws.id
),0);

COMMIT;

