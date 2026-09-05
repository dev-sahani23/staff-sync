import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { payslipsApi } from '@/services/payslips';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Download, Printer, User, Receipt, AlertTriangle } from 'lucide-react';

export const PayslipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: payslip, isLoading } = useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payslipsApi.get(id!),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await payslipsApi.downloadPdf(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip-${id?.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Unable to download PDF at this time.');
    }
  };

  if (isLoading || !payslip) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  const lines = payslip.lines || [];
  // Sort lines by sequence
  const sortedLines = [...lines].sort((a, b) => {
    const seqA = a.salaryRule?.sequence ?? 99;
    const seqB = b.salaryRule?.sequence ?? 99;
    return seqA - seqB;
  });

  const employeeName = payslip.employee
    ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
    : 'Employee';

  const periodLabel = payslip.payrun
    ? `${new Date(payslip.payrun.periodStart).toLocaleDateString()} – ${new Date(payslip.payrun.periodEnd).toLocaleDateString()}`
    : 'Monthly Period';

  return (
    <div className="max-w-[960px] mx-auto print:max-w-none print:p-0">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: 'Payslips', href: '/payroll/payslips' },
            { label: `${employeeName} - ${periodLabel}` },
          ]}
        />
      </div>

      {/* Main Payslip Statement Card */}
      <div className="bg-white border border-[#DDE3EC] rounded-2xl p-6 sm:p-8 shadow-xs print:border-none print:shadow-none">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE3EC]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#17233D]">
                Salary Payslip Statement
              </h1>
              <StatusBadge status={payslip.payrun?.status || 'VALIDATED'} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official salary computation slip for period {periodLabel}
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2F5D82] hover:bg-[#254B68] rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Identity & Context Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6 p-4 rounded-xl bg-[#F4F6F9] border border-[#DDE3EC] text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Employee Name</span>
            <Link
              to={`/employees/${payslip.employeeId}`}
              className="font-bold text-[#17233D] hover:text-[#2F5D82] hover:underline flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-[#2F5D82]" />
              {employeeName}
            </Link>
            <span className="text-slate-400 block mt-0.5">{payslip.employee?.jobPosition || 'Employee'}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Parent Payrun</span>
            <Link
              to={`/payroll/payruns/${payslip.payrunId}`}
              className="font-bold text-[#17233D] hover:text-[#2F5D82] hover:underline flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5 text-[#2F5D82]" />
              {payslip.payrun?.name || 'Payrun Batch'}
            </Link>
            <span className="text-slate-400 block mt-0.5">{periodLabel}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Contract & Structure</span>
            <span className="font-bold text-[#17233D] block">
              {payslip.contract?.salaryStructure?.name || 'Standard Structure'}
            </span>
            <span className="text-slate-500 block mt-0.5 tabular-nums">
              Base: ₹{payslip.contract?.wage.toLocaleString('en-IN') || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Attendance Days</span>
            <span className="font-bold text-[#17233D] block text-sm tabular-nums">
              {payslip.workedDays} days worked
            </span>
            <span className="text-slate-400 block mt-0.5">Full Attendance Rate</span>
          </div>
        </div>

        {/* Banking Notice / Warning */}
        {(!payslip.employee?.bankName || !payslip.employee?.accountNumber) && (
          <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#B4780A] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Direct deposit banking details missing on this employee profile. Cheque or manual disbursement required.
            </span>
          </div>
        )}

        {/* Salary Computation Table */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-[#17233D] mb-3">
            Itemized Salary Computation
          </h3>

          <div className="border border-[#DDE3EC] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE3EC] text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Seq</th>
                  <th className="py-2.5 px-4">Rule Code</th>
                  <th className="py-2.5 px-4">Line Item Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Computed Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC]">
                {sortedLines.map((line, idx) => {
                  const isNet =
                    line.salaryRule?.category === 'NET' ||
                    line.label.toUpperCase().includes('NET');
                  const isDeduction = line.salaryRule?.category === 'DEDUCTION';

                  return (
                    <tr
                      key={line.id || idx}
                      className={
                        isNet
                          ? 'bg-emerald-50/70 font-bold text-[#1E7A4C]'
                          : 'hover:bg-slate-50/50'
                      }
                    >
                      <td className="py-3 px-4 font-semibold text-slate-500 tabular-nums">
                        #{line.salaryRule?.sequence ?? idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {line.salaryRule?.code || 'LINE'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#17233D]">
                        {line.label}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            line.salaryRule?.category === 'BASIC'
                              ? 'bg-blue-50 text-blue-700'
                              : line.salaryRule?.category === 'ALLOWANCE'
                              ? 'bg-emerald-50 text-[#1E7A4C]'
                              : isDeduction
                              ? 'bg-rose-50 text-[#B23B3B]'
                              : isNet
                              ? 'bg-emerald-100 text-[#1E7A4C]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {line.salaryRule?.category || (isNet ? 'NET' : 'PAY')}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold tabular-nums text-sm ${
                          isNet
                            ? 'text-[#1E7A4C] text-base'
                            : isDeduction
                            ? 'text-[#B23B3B]'
                            : 'text-[#17233D]'
                        }`}
                      >
                        {isDeduction && '- '}₹{line.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>PeoplePay360 Enterprise Payroll Engine • Confirmed by System Dispatch</span>
          <span>Payment Reference: SLIP-{payslip.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
