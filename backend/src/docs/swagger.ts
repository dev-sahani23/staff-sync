export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PeoplePay360 - HR & Payroll Operations API',
    version: '1.0.0',
    description:
      'Complete REST API documentation for PeoplePay360 Platform covering Auth, Master Data, Salary Rules, 2-Step Payrun Wizard, Payslip PDF Generation, and Dashboard Aggregation APIs.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT Bearer token generated from /auth/login',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/salary-structures': {
      get: {
        summary: 'List all Salary Structures',
        tags: ['Salary Structures & Rules'],
        responses: {
          '200': { description: 'List of salary structures with rule counts' },
        },
      },
      post: {
        summary: 'Create Salary Structure',
        tags: ['Salary Structures & Rules'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Regular Full-Time Structure' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Salary structure created successfully' },
        },
      },
    },
    '/salary-structures/{id}': {
      get: {
        summary: 'Get Salary Structure detail with ordered rules',
        tags: ['Salary Structures & Rules'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Salary structure details' } },
      },
    },
    '/salary-structures/{id}/rules': {
      post: {
        summary: 'Add a Salary Rule to Structure',
        tags: ['Salary Structures & Rules'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name', 'category', 'sequence', 'computeMethod'],
                properties: {
                  code: { type: 'string', example: 'HRA' },
                  name: { type: 'string', example: 'House Rent Allowance' },
                  category: { type: 'string', enum: ['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET'] },
                  sequence: { type: 'integer', example: 2 },
                  computeMethod: { type: 'string', enum: ['FIXED', 'PERCENTAGE', 'FORMULA'] },
                  amount: { type: 'number', example: 40 },
                  baseCode: { type: 'string', example: 'BASIC' },
                  formula: { type: 'string', example: 'BASIC * 0.4' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Rule added to structure' } },
      },
    },
    '/payruns/draft': {
      post: {
        summary: 'Wizard Step 1: Preview Draft Payrun Scope & Eligible Staff',
        tags: ['Payrun Operations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['salaryStructureId', 'periodStart', 'periodEnd'],
                properties: {
                  salaryStructureId: { type: 'string', format: 'uuid' },
                  periodStart: { type: 'string', example: '2026-09-01' },
                  periodEnd: { type: 'string', example: '2026-09-30' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Preview of matching active employees' } },
      },
    },
    '/payruns': {
      get: {
        summary: 'List all Payruns',
        tags: ['Payrun Operations'],
        responses: { '200': { description: 'List of payrun batches' } },
      },
      post: {
        summary: 'Wizard Step 2: Create Payrun Batch in DRAFT status',
        tags: ['Payrun Operations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'salaryStructureId', 'periodStart', 'periodEnd', 'employeeIds'],
                properties: {
                  name: { type: 'string', example: 'September 2026 Payroll' },
                  salaryStructureId: { type: 'string', format: 'uuid' },
                  periodStart: { type: 'string', example: '2026-09-01' },
                  periodEnd: { type: 'string', example: '2026-09-30' },
                  employeeIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Payrun created in DRAFT status' } },
      },
    },
    '/payruns/{id}/compute': {
      post: {
        summary: 'Step 3: Execute Batch Salary Computation Pipeline',
        tags: ['Payrun Operations'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Batch computed and payslips generated' } },
      },
    },
    '/payruns/{id}/validate': {
      patch: {
        summary: 'Step 4a: Validate Payrun Batch',
        tags: ['Payrun Operations'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Payrun status updated to VALIDATED' } },
      },
    },
    '/payruns/{id}/mark-paid': {
      patch: {
        summary: 'Step 4b: Finalize & Mark Payrun as PAID (Locks records)',
        tags: ['Payrun Operations'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Payrun status updated to PAID' } },
      },
    },
    '/payruns/{id}/send': {
      post: {
        summary: 'Step 5: Bulk Email Dispatch (Nodemailer Async Worker)',
        tags: ['Payrun Operations'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '202': { description: 'Email dispatch queued in background' } },
      },
    },
    '/payslips/{id}/pdf': {
      get: {
        summary: 'Generate & Stream Printable Payslip PDF (Puppeteer)',
        tags: ['Payslips & Documents'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Binary PDF Stream',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
        },
      },
    },
    '/dashboard/kpis': {
      get: {
        summary: 'Top-Level Payroll & HR KPI Cards',
        tags: ['Dashboard & Analytics'],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'KPI metrics' } },
      },
    },
    '/dashboard/salary-cost-by-department': {
      get: {
        summary: 'Salary Spend Breakdown by Department',
        tags: ['Dashboard & Analytics'],
        responses: { '200': { description: 'Department costs list' } },
      },
    },
    '/dashboard/monthly-net-trend': {
      get: {
        summary: 'Monthly Net Payout Historical Trend',
        tags: ['Dashboard & Analytics'],
        responses: { '200': { description: 'Monthly trend list' } },
      },
    },
    '/dashboard/attendance-overview': {
      get: {
        summary: 'Attendance Distribution Overview',
        tags: ['Dashboard & Analytics'],
        responses: { '200': { description: 'Attendance breakdown' } },
      },
    },
    '/dashboard/alerts': {
      get: {
        summary: 'Operational Alerts & Warnings Report',
        tags: ['Dashboard & Analytics'],
        responses: { '200': { description: 'Alerts and warning items' } },
      },
    },
  },
};
