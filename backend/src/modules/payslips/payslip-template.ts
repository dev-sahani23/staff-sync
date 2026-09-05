export interface PayslipTemplateData {
  companyName: string;
  payslipId: string;
  payrunName: string;
  periodStart: string;
  periodEnd: string;
  employee: {
    id: string;
    fullName: string;
    email: string;
    department?: string | null;
    jobPosition?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
  };
  contractWage: number;
  workedDays: number;
  totalWorkingDays: number;
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
  lines: Array<{
    code: string;
    label: string;
    category: string;
    amount: number;
  }>;
}

export function generatePayslipHtml(data: PayslipTemplateData): string {
  const earnings = data.lines.filter(
    (l) => l.category === 'BASIC' || l.category === 'ALLOWANCE' || l.category === 'GROSS'
  );
  const deductions = data.lines.filter((l) => l.category === 'DEDUCTION');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${data.employee.fullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      background-color: #ffffff;
      color: #1e293b;
      padding: 32px;
      font-size: 13px;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .payslip-badge {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 14px;
      border-radius: 6px;
      text-align: right;
    }

    .payslip-badge h3 {
      font-size: 14px;
      color: #0f172a;
      font-weight: 600;
    }

    .payslip-badge p {
      font-size: 11px;
      color: #64748b;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .meta-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .meta-label {
      color: #64748b;
      font-weight: 500;
    }

    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .table-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    th {
      background-color: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 9px 12px;
      font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .text-right {
      text-align: right;
    }

    .amount-val {
      font-weight: 600;
      color: #0f172a;
    }

    .summary-card {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 14px;
      border-radius: 8px;
      text-align: center;
    }

    .card.net {
      background-color: #f0fdf4;
      border-color: #bbf7d0;
    }

    .card-title {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .card.net .card-title {
      color: #166534;
    }

    .card-amount {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }

    .card.net .card-amount {
      color: #15803d;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>

  <div class="header-container">
    <div>
      <div class="brand-title">PeoplePay360</div>
      <div class="brand-subtitle">Integrated HR & Payroll Operations Platform</div>
    </div>
    <div class="payslip-badge">
      <h3>SALARY PAYSLIP</h3>
      <p>Payrun: ${data.payrunName}</p>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <div class="meta-row">
        <span class="meta-label">Employee Name:</span>
        <span class="meta-value">${data.employee.fullName}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Email:</span>
        <span class="meta-value">${data.employee.email}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Department:</span>
        <span class="meta-value">${data.employee.department || 'N/A'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Job Position:</span>
        <span class="meta-value">${data.employee.jobPosition || 'N/A'}</span>
      </div>
    </div>
    <div class="meta-col">
      <div class="meta-row">
        <span class="meta-label">Pay Period:</span>
        <span class="meta-value">${new Date(data.periodStart).toLocaleDateString()} - ${new Date(data.periodEnd).toLocaleDateString()}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Worked Days:</span>
        <span class="meta-value">${data.workedDays} / ${data.totalWorkingDays} days</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Bank Name:</span>
        <span class="meta-value">${data.employee.bankName || 'Not Provided'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Account No:</span>
        <span class="meta-value">${data.employee.accountNumber || 'Not Provided'}</span>
      </div>
    </div>
  </div>

  <div class="table-container">
    <div>
      <div class="section-title">Earnings & Allowances</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${
            earnings.length > 0
              ? earnings
                  .map(
                    (e) => `
              <tr>
                <td>${e.label} (${e.code})</td>
                <td class="text-right amount-val">₹${e.amount.toLocaleString()}</td>
              </tr>
            `
                  )
                  .join('')
              : `<tr><td colspan="2" style="text-align:center; color:#94a3b8;">No earnings recorded</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div>
      <div class="section-title">Deductions</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${
            deductions.length > 0
              ? deductions
                  .map(
                    (d) => `
              <tr>
                <td>${d.label} (${d.code})</td>
                <td class="text-right amount-val" style="color:#b91c1c;">- ₹${d.amount.toLocaleString()}</td>
              </tr>
            `
                  )
                  .join('')
              : `<tr><td colspan="2" style="text-align:center; color:#94a3b8;">No deductions recorded</td></tr>`
          }
        </tbody>
      </table>
    </div>
  </div>

  <div class="summary-card">
    <div class="card">
      <div class="card-title">Gross Earnings</div>
      <div class="card-amount">₹${data.grossTotal.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-title">Total Deductions</div>
      <div class="card-amount" style="color: #b91c1c;">₹${data.deductionsTotal.toLocaleString()}</div>
    </div>
    <div class="card net">
      <div class="card-title">Net Salary Payable</div>
      <div class="card-amount">₹${data.netTotal.toLocaleString()}</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated by PeoplePay360 Platform</span>
    <span>Computer Generated Payslip - No Signature Required</span>
    <span>Date: ${new Date().toLocaleDateString()}</span>
  </div>

</body>
</html>
  `.trim();
}
