![header](https://capsule-render.vercel.app/api?type=waving&color=0:0b0f19,100:336791&height=200&section=header&text=PeoplePay360&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Integrated%20HR%20%26%20Payroll%20Operations%20Platform&descAlignY=58&descSize=18)

<div align="center">

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1200&color=61DAFB&center=true&vCenter=true&width=780&lines=Employee+Lifecycle+%E2%86%92+Contracts+%E2%86%92+Attendance+%E2%86%92+Payroll;Two-Step+Payrun+Wizard+with+Live+Validation+Warnings;Rule-Based+Salary+Engine+%2B+PDF+Payslips+%2B+Bulk+Email;Role-Based+Access+Control+for+5+Distinct+User+Roles)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-68A063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E63DD?style=for-the-badge)](https://zod.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Why This Project Matters](#2-why-this-project-matters)
3. [Core Features](#3-core-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Database Design (ER Diagram)](#6-database-design-er-diagram)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [End-to-End Business Flow](#8-end-to-end-business-flow)
9. [Payrun Processing Workflow](#9-payrun-processing-workflow)
10. [Time Off Request Flow](#10-time-off-request-flow)
11. [Project Structure](#11-project-structure)
12. [Getting Started](#12-getting-started)
13. [Environment Variables](#13-environment-variables)
14. [Available Scripts](#14-available-scripts)
15. [API Reference (Summary)](#15-api-reference-summary)
16. [Validation Strategy (Zod)](#16-validation-strategy-zod)
17. [Logging & Monitoring](#17-logging--monitoring)
18. [Email Delivery (Nodemailer)](#18-email-delivery-nodemailer)
19. [Payslip PDF Generation](#19-payslip-pdf-generation)
20. [Testing Strategy](#20-testing-strategy)
21. [Security](#21-security)
22. [Deployment](#22-deployment)
23. [Roadmap](#23-roadmap)
24. [Contributing](#24-contributing)
25. [License](#25-license)

---

## 1. Overview

**PeoplePay360** is a production-grade **HR & Payroll platform** that unifies employee master
data, attendance, time off, and payroll into a single connected operational flow — rather than
a set of disconnected CRUD screens.

The **Employee** record is the central hub. Every other module — **Contracts**, **Working
Schedules**, **Attendance**, **Time Off**, **Salary Structures/Rules**, and **Payruns** — links
back to it, so that payroll always computes against the *correct, period-specific* contract,
the *correct* schedule, and the *correct* leave balance.

> Design mockups: [Excalidraw board](https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex)

## 2. Why This Project Matters

Most lightweight HR tools store employee, attendance, leave, and salary data as isolated
records. Real payroll operations require these records to interact:

- An employee may have **multiple historical contracts** — payroll must resolve the one
  applicable to the selected period, with no overlapping active contracts.
- **Working hours** originate from an assigned schedule, and attendance may contain
  exceptions that require manual review and correction.
- **Leave balances** depend on approved allocations, and every approved request must
  atomically deduct from the correct balance.
- **Payroll** must transform all of the above into a validated, auditable payslip before
  payment and distribution.

PeoplePay360 encodes these rules as first-class application logic rather than static
configuration or hardcoded values.

## 3. Core Features

| Domain | Capability |
|---|---|
| Employee Management | Kanban / List / Form views, department, manager, schedule, job position, status |
| Contracts | Full history, active-contract highlighting, period-safe payroll resolution |
| Working Schedules | Day / Start / End / Break pattern editor with auto-computed weekly hours |
| Attendance | Check-in/out, worked hours, exception flags, authorized manual corrections |
| Time Off | Configurable types, allocations, approval workflow, automatic balance deduction |
| Salary Structures & Rules | Sequenced rule engine (fixed / percentage / formula) across Basic → Allowances → Gross → Deductions → Net |
| Payrun Wizard | Two-step wizard: (1) scope + period, (2) explicit employee selection |
| Payslips | Rule-by-rule breakdown, contract-aware computation, validation warnings |
| Distribution | Printable PDF payslips, bulk email delivery per Payrun |
| Payroll Dashboard | Live KPIs, salary cost by department, monthly trends, attendance & leave health |
| Access Control | 5 roles: Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin |

## 4. Technology Stack

![Tech Stack](./assets/tech-stack.png)

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, React Router, TanStack Query, TailwindCSS, Recharts |
| Backend | Node.js, Express.js, TypeScript, Zod, JSON Web Tokens (RBAC), Morgan, Nodemailer |
| Data | PostgreSQL, Prisma ORM, Redis (optional caching/queues) |
| Documents | PDFKit / Puppeteer for payslip PDF rendering |
| Observability | Morgan (HTTP access logs), Winston (application logs) |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions CI/CD |
| Testing | Jest, Supertest, React Testing Library |
| Config | dotenv + Zod-validated environment schema |

## 5. System Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend — React + TypeScript"]
        UI[SPA: Employees / Contracts / Attendance / Time Off / Payroll / Dashboard]
    end

    subgraph Edge["Edge"]
        NG[Nginx Reverse Proxy]
    end

    subgraph API["Backend — Node.js + Express + TypeScript"]
        MW1[Morgan Logger]
        MW2[JWT Auth + RBAC Middleware]
        MW3[Zod Request Validation]
        CTRL[Controllers / Services]
        RULE[Salary Rule Engine]
        PDF[PDFKit / Puppeteer]
        MAIL[Nodemailer Service]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        PRISMA[Prisma ORM]
        RD[(Redis - optional)]
    end

    SMTP[[SMTP Provider]]

    UI -->|HTTPS / REST JSON| NG --> MW1 --> MW2 --> MW3 --> CTRL
    CTRL --> RULE
    CTRL --> PDF
    CTRL --> MAIL --> SMTP
    CTRL --> PRISMA --> PG
    CTRL -.optional cache.-> RD
```

## 6. Database Design (ER Diagram)

```mermaid
erDiagram
    EMPLOYEE ||--o{ CONTRACT : has
    EMPLOYEE ||--o{ ATTENDANCE : logs
    EMPLOYEE ||--o{ TIME_OFF_REQUEST : submits
    EMPLOYEE ||--o{ ALLOCATION : owns
    EMPLOYEE }o--|| WORKING_SCHEDULE : follows
    EMPLOYEE }o--o{ PAYRUN : "selected in"
    CONTRACT }o--|| WORKING_SCHEDULE : uses
    CONTRACT }o--|| SALARY_STRUCTURE : "assigned to"
    SALARY_STRUCTURE ||--o{ SALARY_RULE : contains
    PAYRUN ||--o{ PAYSLIP : generates
    PAYSLIP }o--|| CONTRACT : "computed from"
    PAYSLIP ||--o{ PAYSLIP_LINE : breakdown
    PAYSLIP_LINE }o--|| SALARY_RULE : "derived from"
    TIME_OFF_TYPE ||--o{ ALLOCATION : configures
    TIME_OFF_TYPE ||--o{ TIME_OFF_REQUEST : configures
    ALLOCATION ||--o{ TIME_OFF_REQUEST : "consumed by"
    USER ||--|| ROLE : "assigned"

    EMPLOYEE {
        uuid id PK
        string name
        string department
        uuid manager_id FK
        uuid schedule_id FK
        string job_position
        string status
    }
    CONTRACT {
        uuid id PK
        uuid employee_id FK
        date start_date
        date end_date
        decimal wage
        uuid structure_id FK
        string status
    }
    WORKING_SCHEDULE {
        uuid id PK
        string name
        string type
        decimal weekly_hours
    }
    ATTENDANCE {
        uuid id PK
        uuid employee_id FK
        datetime check_in
        datetime check_out
        decimal worked_hours
        string status
    }
    TIME_OFF_TYPE {
        uuid id PK
        string name
        string unit
        boolean requires_allocation
    }
    ALLOCATION {
        uuid id PK
        uuid employee_id FK
        uuid type_id FK
        decimal allocated
        decimal taken
        decimal remaining
        date valid_from
        date valid_to
    }
    TIME_OFF_REQUEST {
        uuid id PK
        uuid employee_id FK
        uuid type_id FK
        date start_date
        date end_date
        decimal duration
        string status
    }
    SALARY_STRUCTURE {
        uuid id PK
        string name
        boolean active
    }
    SALARY_RULE {
        uuid id PK
        uuid structure_id FK
        string name
        string code
        string category
        int sequence
        string computation_method
    }
    PAYRUN {
        uuid id PK
        string name
        uuid structure_id FK
        date period_start
        date period_end
        string status
    }
    PAYSLIP {
        uuid id PK
        uuid payrun_id FK
        uuid employee_id FK
        uuid contract_id FK
        decimal gross
        decimal net
        string status
    }
    PAYSLIP_LINE {
        uuid id PK
        uuid payslip_id FK
        uuid rule_id FK
        decimal amount
    }
    USER {
        uuid id PK
        string email
        uuid role_id FK
    }
    ROLE {
        uuid id PK
        string name
    }
```

## 7. User Roles & Permissions

| Module | Employee | HR Manager | HR Payroll User | HR Payroll Manager | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Own profile / attendance / leave balance | View | Full | Full | Full | Full |
| Employees, Contracts, Attendance, Schedules, Time Off | — | CRUD | CRUD | CRUD | CRUD |
| Approve / refuse Time Off | — | Yes | Yes | Yes | Yes |
| Payruns & Payslips | — | — | Create / Read / Update | Full CRUD | Full CRUD |
| Salary Structures & Rules | — | — | Read-only | Full CRUD | Full CRUD |
| User management & system administration | — | — | — | — | Full |

## 8. End-to-End Business Flow

```mermaid
flowchart TD
    A[Create Employee Master Record] --> B[Attach Contract + Working Schedule]
    B --> C[Configure Salary Structure and Rules]
    C --> D[Daily Attendance Capture and Exception Review]
    B --> E[Configure Time Off Types and Allocations]
    E --> F[Employee Submits Time Off Request]
    F --> G{Approved?}
    G -- Yes --> H[Deduct from Allocation Balance]
    G -- No --> I[Request Refused - No Balance Change]
    D --> J[Payroll Officer Starts Payrun Wizard]
    H --> J
    C --> J
    J --> K[Step 1: Select Structure and Period]
    K --> L[Step 2: Select Eligible Employees]
    L --> M[Create Payrun Batch]
    M --> N[Compute Payslips using Period Contract + Rules]
    N --> O{Warnings Found?}
    O -- Yes --> P[Resolve Missing Bank Details / Duplicates]
    P --> N
    O -- No --> Q[Validate Payrun]
    Q --> R[Mark Payrun as Paid]
    R --> S[Generate PDF Payslips]
    S --> T[Send Payslips via Email]
    T --> U[Payroll Dashboard Updates Live Metrics]
```

## 9. Payrun Processing Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: NEW clicked -> Wizard Step 1 (Structure, Period)
    Draft --> EmployeeSelection: Continue -> Wizard Step 2
    EmployeeSelection --> Created: Create Payrun (batch initialized)
    Created --> Computed: Compute
    Computed --> WarningsPending: Warnings detected
    WarningsPending --> Computed: Recompute after fix
    Computed --> Validated: Validate (no warnings)
    Validated --> Paid: Mark Paid
    Paid --> Distributed: Send Payslips (bulk email)
    Distributed --> Archived: Preserved as historical record
    Archived --> [*]
```

## 10. Time Off Request Flow

```mermaid
sequenceDiagram
    actor E as Employee
    participant FE as React Frontend
    participant API as Express API
    participant DB as PostgreSQL (Prisma)
    actor HR as HR Manager

    E->>FE: Submit Time Off Request (type, dates)
    FE->>API: POST /api/time-off/requests
    API->>API: Zod validation
    API->>DB: Check Allocation balance
    DB-->>API: Balance sufficient
    API->>DB: Create Request (status = pending)
    API-->>FE: 201 Created
    HR->>FE: Open Requests list
    FE->>API: GET /api/time-off/requests?status=pending
    API-->>FE: Pending requests
    HR->>FE: Approve request
    FE->>API: PATCH /api/time-off/requests/:id {status: approved}
    API->>DB: Update status + deduct Allocation.taken
    DB-->>API: Updated balance
    API-->>FE: 200 OK
    FE-->>E: Notification: Request Approved
```

## 11. Project Structure

```
peoplepay360/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/            # env schema (Zod), db, mailer, logger config
│   │   │   ├── middlewares/       # auth.middleware, rbac.middleware, error.middleware
│   │   │   ├── modules/
│   │   │   │   ├── employees/
│   │   │   │   ├── contracts/
│   │   │   │   ├── schedules/
│   │   │   │   ├── attendance/
│   │   │   │   ├── time-off/
│   │   │   │   ├── salary-structures/
│   │   │   │   ├── salary-rules/
│   │   │   │   ├── payruns/
│   │   │   │   ├── payslips/
│   │   │   │   └── dashboard/
│   │   │   │       └── (controller.ts, service.ts, routes.ts, schema.ts per module)
│   │   │   ├── services/
│   │   │   │   ├── payroll-engine/     # salary rule sequencing + computation
│   │   │   │   ├── pdf/                # payslip PDF generation
│   │   │   │   └── mailer/             # Nodemailer transport + templates
│   │   │   ├── utils/
│   │   │   ├── app.ts                  # Express app, Morgan, security middlewares
│   │   │   └── server.ts               # entrypoint
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── api/                    # typed API client (axios + generated types)
│       │   ├── components/
│       │   ├── features/
│       │   │   ├── employees/
│       │   │   ├── contracts/
│       │   │   ├── attendance/
│       │   │   ├── time-off/
│       │   │   ├── payroll/
│       │   │   └── dashboard/
│       │   ├── routes/
│       │   ├── hooks/
│       │   ├── store/
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .github/workflows/ci.yml
├── assets/
│   └── tech-stack.png
└── README.md
```

## 12. Getting Started

### Prerequisites

- Node.js 20.x and npm/pnpm
- PostgreSQL 15.x (or use the provided Docker Compose service)
- An SMTP account for payslip email delivery (e.g. SMTP relay, Mailtrap for dev)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/peoplepay360.git
cd peoplepay360

# 2. Install dependencies
npm install --workspaces

# 3. Configure environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Start PostgreSQL (Docker) or point to an existing instance
docker compose up -d postgres

# 5. Run Prisma migrations and seed representative data
cd apps/backend
npx prisma migrate deploy
npx prisma db seed

# 6. Start the backend (dev mode)
npm run dev

# 7. Start the frontend (in a new terminal)
cd ../frontend
npm run dev
```

The API defaults to `http://localhost:4000` and the frontend to `http://localhost:5173`.

### Full stack via Docker Compose

```bash
docker compose up --build
```

## 13. Environment Variables

Environment variables are parsed and validated at boot with a **Zod schema**; the process
fails fast with a readable error if any required variable is missing or malformed.

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `PORT` | API port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma) | `postgresql://user:pass@localhost:5432/peoplepay360` |
| `JWT_SECRET` | Secret used to sign access tokens | `change-me` |
| `JWT_EXPIRES_IN` | Access token TTL | `1d` |
| `SMTP_HOST` | SMTP server host | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `apikey` |
| `SMTP_PASS` | SMTP password / API key | `********` |
| `MAIL_FROM` | Default "from" address for payslip emails | `payroll@peoplepay360.io` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `LOG_LEVEL` | Winston log level | `info` |

## 14. Available Scripts

| Command | Location | Description |
|---|---|---|
| `npm run dev` | backend / frontend | Start in watch mode |
| `npm run build` | backend / frontend | Compile TypeScript / build production bundle |
| `npm run start` | backend | Run compiled production server |
| `npm run lint` | backend / frontend | ESLint check |
| `npm run test` | backend | Jest + Supertest suite |
| `npx prisma studio` | backend | Visual database browser |
| `npx prisma migrate dev` | backend | Create and apply a new migration |
| `npx prisma db seed` | backend | Seed representative demo data |

## 15. API Reference (Summary)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and issue JWT | Public |
| `GET` | `/api/employees` | List employees (filterable) | HR Manager+ |
| `POST` | `/api/employees` | Create employee | HR Manager+ |
| `GET` | `/api/contracts?employeeId=` | List contracts for an employee | HR Manager+ |
| `POST` | `/api/attendance` | Create attendance entry | Employee (own) / HR Manager+ |
| `PATCH` | `/api/attendance/:id/correct` | Manual correction | HR Manager+ |
| `POST` | `/api/time-off/requests` | Submit time off request | Employee |
| `PATCH` | `/api/time-off/requests/:id` | Approve / refuse request | HR Manager+ |
| `POST` | `/api/payruns` | Create a Payrun (Step 2 of wizard) | HR Payroll User+ |
| `POST` | `/api/payruns/:id/compute` | Compute payslips for a batch | HR Payroll User+ |
| `POST` | `/api/payruns/:id/validate` | Validate computed payslips | HR Payroll Manager |
| `POST` | `/api/payruns/:id/mark-paid` | Mark batch as paid | HR Payroll Manager |
| `POST` | `/api/payruns/:id/send-payslips` | Bulk email PDF payslips | HR Payroll User+ |
| `GET` | `/api/payslips/:id/pdf` | Download a single payslip PDF | HR Payroll User+ / Employee (own) |
| `GET` | `/api/dashboard?period=&department=` | Aggregated payroll dashboard metrics | HR Payroll User+ |

## 16. Validation Strategy (Zod)

Every request body, query, and route param is validated at the edge before it reaches a
controller, using shared Zod schemas that also drive TypeScript types on both frontend
and backend:

```ts
// modules/time-off/schema.ts
import { z } from "zod";

export const createTimeOffRequestSchema = z.object({
  employeeId: z.string().uuid(),
  typeId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "endDate must be on or after startDate",
  path: ["endDate"],
});

export type CreateTimeOffRequestInput = z.infer<typeof createTimeOffRequestSchema>;
```

A single `validate(schema)` middleware wraps every route, returning a structured `400`
response with field-level errors on failure.

## 17. Logging & Monitoring

- **Morgan** is mounted globally in `app.ts` in `combined` format for production and
  `dev` format locally, streaming into **Winston** for structured, rotated log files.
- **Winston** captures application-level events (auth failures, payroll computation
  errors, email delivery failures) with correlation IDs per request.
- Health check endpoint: `GET /health` for uptime monitors and container orchestrators.

```ts
// app.ts
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  stream: { write: (message) => logger.http(message.trim()) },
}));
```

## 18. Email Delivery (Nodemailer)

Bulk payslip delivery from a Payrun uses a pooled **Nodemailer** transport with retry and
per-recipient error isolation, so one failed address never blocks the rest of the batch:

```ts
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  pool: true,
  maxConnections: 5,
});

await Promise.allSettled(
  payslips.map((slip) =>
    transporter.sendMail({
      from: env.MAIL_FROM,
      to: slip.employee.email,
      subject: `Payslip — ${payrun.periodLabel}`,
      html: renderPayslipEmail(slip),
      attachments: [{ filename: `payslip-${slip.id}.pdf`, content: slip.pdfBuffer }],
    })
  )
);
```

## 19. Payslip PDF Generation

Each payslip is rendered server-side (PDFKit for lightweight tabular output, or Puppeteer
for full HTML/CSS templating) with:

- Employee, structure, pay run, and period identification
- Rule-by-rule breakdown grouped by category (Basic, Allowances, Deductions, Gross, Net)
- Contract reference and worked days
- Digitally consistent branding for print and email delivery

## 20. Testing Strategy

| Layer | Tooling | Focus |
|---|---|---|
| Unit | Jest | Salary rule engine, allocation balance math, contract period resolution |
| Integration | Jest + Supertest | API routes, RBAC middleware, Zod validation errors |
| E2E (optional) | Playwright | Payrun wizard, time off approval, dashboard filters |

## 21. Security

- Password hashing with `bcrypt`; JWT access tokens with short TTL
- Role-Based Access Control enforced centrally via middleware, not per-controller checks
- Helmet for secure HTTP headers; rate limiting on authentication endpoints
- All input validated with Zod before touching the database (defense against injection)
- Audit trail on Payrun state transitions and Attendance manual corrections

## 22. Deployment

```mermaid
flowchart LR
    Dev[Developer Push] --> GH[GitHub Actions CI]
    GH --> Lint[Lint + Type Check]
    Lint --> Test[Jest Test Suite]
    Test --> Build[Docker Build: backend + frontend images]
    Build --> Registry[(Container Registry)]
    Registry --> Deploy[Deploy via Docker Compose / Orchestrator]
    Deploy --> Nginx[Nginx Reverse Proxy]
    Nginx --> Prod((Production))
```

- `docker-compose.yml` provisions `postgres`, `backend`, `frontend`, and `nginx` services.
- Database migrations run automatically on backend container startup via
  `prisma migrate deploy`.
- Environment-specific secrets are injected via the orchestrator's secret store, never
  committed to the repository.

## 23. Roadmap

- Multi-currency payroll and localized tax rule packs
- Employee self-service mobile app
- Configurable approval chains for Time Off (multi-level)
- Bank file export (ACH / NEFT) for payment batches
- Audit log viewer and exportable compliance reports
- Pluggable biometric/device attendance integrations

## 24. Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Follow the existing module structure under `apps/backend/src/modules`
3. Add or update tests for any behavioral change
4. Run `npm run lint && npm run test` before opening a pull request
5. Submit a PR with a clear description and, where relevant, updated documentation

## 25. License

Distributed under the MIT License. See `LICENSE` for details.

---

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:336791,100:0b0f19&height=120&section=footer)