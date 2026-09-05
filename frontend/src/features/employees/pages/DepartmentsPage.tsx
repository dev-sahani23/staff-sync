import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi, type DepartmentSummary } from '@/services/departments';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Building, Users } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const columns: Column<DepartmentSummary>[] = [
    {
      key: 'name',
      header: 'Department Name',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5 font-semibold text-[#17233D]">
          <Building className="w-4 h-4 text-[#2F5D82]" />
          <span>{d.name}</span>
        </div>
      ),
    },
    {
      key: 'headcount',
      header: 'Active Headcount',
      align: 'right',
      sortable: true,
      render: (d) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs bg-[#EAF1F6] text-[#2F5D82] px-2.5 py-0.5 rounded-full tabular-nums">
          <Users className="w-3 h-3" />
          {d.headcount} {d.headcount === 1 ? 'member' : 'members'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <StatusBadge status={d.active ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'HR' },
          { label: 'Departments' },
        ]}
      />

      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Departments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational divisions and active personnel distributions
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        keyExtractor={(d) => d.name}
        onRowClick={(d) => navigate(`/employees?department=${encodeURIComponent(d.name)}`)}
        isLoading={isLoading}
        emptyTitle="No departments found"
        emptyDescription="Departments are automatically established when assigned to employee profiles."
      />
    </div>
  );
};
