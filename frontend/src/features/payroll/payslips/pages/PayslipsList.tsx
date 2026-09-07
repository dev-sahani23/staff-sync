import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { payslipsApi } from '@/services/payslips';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { usePermissions } from '@/lib/permissions';
import { Download } from 'lucide-react';
import type { Payslip } from '@/types';

export const PayslipsList: React.FC = () => {
  const navigate = useNavigate();
  const { isEmployee } = usePermissions();
  const [searchParams] = useSearchParams();
  const payrunIdFilter = searchParams.get('payrunId');

  // Fetch payslips using payslipsApi.listAll or getMyPayslips
  const { data: allPayslips = [], isLoading } = useQuery({
    queryKey: ['payslips', isEmployee ? 'my' : 'all', payrunIdFilter],
    queryFn: () =>
      isEmployee
        ? payslipsApi.getMyPayslips()
        : payslipsApi.listAll({ payrunId: payrunIdFilter || undefined }),
  });

  const handleDownloadPdf = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const blob = await payslipsApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip-${id.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Unable to generate PDF payslip at this time.');
    }
  };

  const columns: Column<Payslip>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-semibold text-[#17233D]">
            {s.employee ? `${s.employee.firstName} ${s.employee.lastName}` : 'Current Employee'}
          </div>
          <div className="text-xs text-slate-400">
            {s.employee?.department || 'General'}
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Pay Period',
      render: (s) => (
        <span className="text-xs text-slate-600">
          {s.payrun ? `${new Date(s.payrun.periodStart).toLocaleDateString()} – ${new Date(s.payrun.periodEnd).toLocaleDateString()}` : 'Monthly Period'}
        </span>
      ),
    },
    {
      key: 'workedDays',
      header: 'Worked Days',
      align: 'right',
      render: (s) => (
        <span className="text-xs tabular-nums text-slate-700 font-semibold">
          {s.workedDays} days
        </span>
      ),
    },
    {
      key: 'wage',
      header: 'Base Wage',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-semibold tabular-nums text-slate-800">
          ₹{s.contract?.wage?.toLocaleString('en-IN') || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.payrun?.status || 'COMPUTED'} />,
    },
    {
      key: 'actions',
      header: 'Print / PDF',
      align: 'center',
      render: (s) => (
        <button
          type="button"
          onClick={(e) => handleDownloadPdf(e, s.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F5D82] hover:text-[#17233D] p-1.5 rounded hover:bg-slate-100 transition-colors"
          title="Download Printable PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PDF</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Payroll', href: '/payroll' },
          { label: isEmployee ? 'My Payslips' : 'All Payslips' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            {isEmployee ? 'My Payslips' : 'Payslips Directory'}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Individual salary calculation slips, breakdown statements, and printable PDFs
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allPayslips}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/payroll/payslips/${s.id}`)}
        isLoading={isLoading}
        emptyTitle="No payslips available"
        emptyDescription="Payslips appear after payruns are generated and computed."
      />
    </div>
  );
};
