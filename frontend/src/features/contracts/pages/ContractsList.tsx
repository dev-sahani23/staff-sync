import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '@/services/contracts';
import { employeesApi } from '@/services/employees';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { FileText, Plus, X, User, ArrowLeft } from 'lucide-react';
import type { Contract } from '@/types';

export const ContractsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeIdFilter = searchParams.get('employeeId');

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.list,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', employeeIdFilter],
    queryFn: () => employeesApi.get(employeeIdFilter!),
    enabled: !!employeeIdFilter,
  });

  const filteredContracts = contracts.filter((c) => {
    if (!employeeIdFilter) return true;
    return c.employeeId === employeeIdFilter;
  });

  const columns: Column<Contract>[] = [
    {
      key: 'code',
      header: 'Contract Reference',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2 font-semibold text-[#17233D]">
          <FileText className="w-4 h-4 text-[#2F5D82]" />
          <span>CON-{c.id.substring(0, 6).toUpperCase()}</span>
        </div>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (c) => (
        <span className="font-medium text-[#2F5D82]">
          {c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (c) => (
        <span className="text-xs text-slate-600">
          {new Date(c.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (c) => (
        <span className="text-xs text-slate-500">
          {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'wage',
      header: 'Wage / Month',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-[#17233D] tabular-nums">
          ₹{c.wage.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Contract Status',
      sortable: true,
      render: (c) => <StatusBadge status={c.status} />,
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'HR', href: '/employees' },
          { label: 'Contracts' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Contracts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active employment agreements, wages, and assigned salary structures
          </p>
        </div>

        <Can permission="contracts:write">
          <button
            onClick={() => navigate('/contracts/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] text-white text-xs font-semibold rounded-lg hover:bg-[#254B68] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        </Can>
      </div>

      {/* Pre-filtered Employee Filter Chip */}
      {employeeIdFilter && (
        <div className="mb-4 flex items-center gap-2 bg-[#EAF1F6] border border-blue-200/80 rounded-xl px-4 py-2 text-xs">
          <span className="text-slate-600">Filtered for:</span>
          <span className="font-bold text-[#2F5D82] flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {employee ? `${employee.firstName} ${employee.lastName}` : employeeIdFilter}
          </span>
          <button
            onClick={() => {
              searchParams.delete('employeeId');
              setSearchParams(searchParams);
            }}
            className="ml-auto p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
            title="Clear filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <Link
            to={`/employees/${employeeIdFilter}`}
            className="text-[#2F5D82] font-semibold hover:underline border-l border-blue-200 pl-2 ml-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Profile
          </Link>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredContracts}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => navigate(`/contracts/${c.id}`)}
        isLoading={isLoading}
        emptyTitle="No contracts found"
        emptyDescription="Create an employment contract to define wages and assign a salary structure."
      />
    </div>
  );
};
