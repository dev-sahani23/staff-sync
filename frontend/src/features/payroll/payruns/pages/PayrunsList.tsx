import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { payrunsApi } from '@/services/payruns';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PayrunWizardModal } from '../components/PayrunWizardModal';
import { Can } from '@/lib/permissions';
import { Receipt, Plus, Users, AlertTriangle } from 'lucide-react';
import type { Payrun } from '@/types';

export const PayrunsList: React.FC = () => {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: payruns = [], isLoading } = useQuery({
    queryKey: ['payruns'],
    queryFn: () => payrunsApi.list(),
  });

  const filteredPayruns = payruns.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const columns: Column<Payrun>[] = [
    {
      key: 'name',
      header: 'Payrun Period / Batch',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2 font-semibold text-[#17233D]">
          <Receipt className="w-4 h-4 text-[#2F5D82]" />
          <span>{p.name}</span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Payroll Window',
      render: (p) => (
        <span className="text-xs text-slate-600">
          {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'structure',
      header: 'Salary Structure',
      render: (p) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.salaryStructure?.name || 'Standard Structure'}
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Payslips Generated',
      align: 'right',
      render: (p) => {
        const count = p.totalPayslips ?? p.payslips?.length ?? p._count?.payslips ?? 0;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EAF1F6] text-[#2F5D82] px-2 py-0.5 rounded-full tabular-nums">
            <Users className="w-3 h-3" />
            {count} {count === 1 ? 'slip' : 'slips'}
          </span>
        );
      },
    },
    {
      key: 'warnings',
      header: 'Warnings',
      align: 'center',
      render: (p) => {
        const warningCount =
          p.warningsCount ??
          p.payslips?.filter((s) => s.warnings && s.warnings.length > 0).length ??
          0;
        if (warningCount === 0) return <span className="text-gray-300 text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md tabular-nums shadow-none border-0">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
            {warningCount} issues
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Payroll', href: '/payroll' },
          { label: 'Payruns' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Payrun Batches</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Periodic payroll generation, computation review, approval validation, and disbursement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-none border-0">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-2">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border-0 rounded-md px-3 h-9 bg-[#F3F4F6] text-[#111827] outline-none focus:bg-white focus:border-2 focus:border-[#3B82F6]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="COMPUTED">COMPUTED</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          <Can permission="payroll:write">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 px-5 h-10 bg-[#3B82F6] text-white text-xs font-bold rounded-md hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Payrun
            </button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayruns}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => navigate(`/payroll/payruns/${p.id}`)}
        isLoading={isLoading}
        emptyTitle="No payrun batches generated"
        emptyDescription="Create a new payrun batch using the wizard to generate monthly payslips."
        emptyActionText="Create Payrun"
        onEmptyAction={() => setIsWizardOpen(true)}
      />

      {/* Payrun 2-Step Wizard Modal */}
      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
};
