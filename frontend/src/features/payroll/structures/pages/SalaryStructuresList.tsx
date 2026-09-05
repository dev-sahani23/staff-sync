import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { salaryStructuresApi } from '@/services/salary-structures';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { Layers, Plus, Users, FileCode } from 'lucide-react';
import type { SalaryStructure } from '@/types';

export const SalaryStructuresList: React.FC = () => {
  const navigate = useNavigate();

  const { data: structures = [], isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: salaryStructuresApi.list,
  });

  const columns: Column<SalaryStructure>[] = [
    {
      key: 'name',
      header: 'Structure Name',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2 font-semibold text-[#17233D]">
          <Layers className="w-4 h-4 text-[#2F5D82]" />
          <span>{s.name}</span>
        </div>
      ),
    },
    {
      key: 'rulesCount',
      header: 'Rules Included',
      align: 'right',
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#F4F6F9] text-[#2F5D82] border border-[#DDE3EC] px-2 py-0.5 rounded-full tabular-nums">
          <FileCode className="w-3 h-3" />
          {s.rules?.length || s._count?.rules || 0} rules
        </span>
      ),
    },
    {
      key: 'employeesCount',
      header: 'Assigned Contracts',
      align: 'right',
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EAF1F6] text-[#2F5D82] px-2 py-0.5 rounded-full tabular-nums">
          <Users className="w-3 h-3" />
          {s.contracts?.length || s._count?.contracts || 0} contracts
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Payroll', href: '/payroll' },
          { label: 'Salary Structures' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Salary Structures</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation frameworks assembling salary rules, allowances, and statutory deductions
          </p>
        </div>

        <Can permission="structures:write">
          <button
            onClick={() => navigate('/payroll/structures/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] text-white text-xs font-semibold rounded-lg hover:bg-[#254B68] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Structure
          </button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={structures}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/payroll/structures/${s.id}`)}
        isLoading={isLoading}
        emptyTitle="No salary structures configured"
        emptyDescription="Create a salary structure and add rules to calculate employee payslips."
      />
    </div>
  );
};
