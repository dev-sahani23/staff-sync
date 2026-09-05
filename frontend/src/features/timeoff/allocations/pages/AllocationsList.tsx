import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeoffApi } from '@/services/timeoff';
import { employeesApi } from '@/services/employees';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { Plus, X, User, ArrowLeft } from 'lucide-react';
import type { LeaveAllocation } from '@/types';

export const AllocationsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeIdFilter = searchParams.get('employeeId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(employeeIdFilter || '');
  const [timeOffTypeId, setTimeOffTypeId] = useState('');
  const [allocated, setAllocated] = useState<number>(20);

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ['timeoff', 'allocations'],
    queryFn: timeoffApi.getAllocations,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const { data: types = [] } = useQuery({
    queryKey: ['timeoff', 'types'],
    queryFn: timeoffApi.getTypes,
  });

  const { data: filterEmployee } = useQuery({
    queryKey: ['employee', employeeIdFilter],
    queryFn: () => employeesApi.get(employeeIdFilter!),
    enabled: !!employeeIdFilter,
  });

  React.useEffect(() => {
    if (!employeeId && employees.length > 0) {
      setEmployeeId(employeeIdFilter || employees[0].id);
    }
  }, [employees, employeeId, employeeIdFilter]);

  React.useEffect(() => {
    if (!timeOffTypeId && types.length > 0) {
      setTimeOffTypeId(types[0].id);
    }
  }, [types, timeOffTypeId]);

  const handleOpenModal = () => {
    setEmployeeId(employeeIdFilter || (employees[0]?.id ?? ''));
    setTimeOffTypeId(types[0]?.id ?? '');
    setAllocated(20);
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Partial<LeaveAllocation>) => timeoffApi.createAllocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'allocations'] });
      setIsModalOpen(false);
      setAllocated(20);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create allocation');
    },
  });

  const filteredAllocations = allocations.filter((a) => {
    if (!employeeIdFilter) return true;
    return a.employeeId === employeeIdFilter;
  });

  const columns: Column<LeaveAllocation>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (a) => (
        <span className="font-semibold text-[#17233D]">
          {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Current Employee'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Leave Policy',
      render: (a) => (
        <span className="text-xs font-medium text-[#2F5D82]">
          {a.timeOffType?.name || 'Annual Leave'}
        </span>
      ),
    },
    {
      key: 'allocated',
      header: 'Allocated Days',
      align: 'right',
      sortable: true,
      render: (a) => <span className="tabular-nums font-semibold">{a.allocated}</span>,
    },
    {
      key: 'taken',
      header: 'Taken Days',
      align: 'right',
      sortable: true,
      render: (a) => <span className="tabular-nums text-slate-500">{a.taken}</span>,
    },
    {
      key: 'remaining',
      header: 'Remaining Balance',
      align: 'right',
      sortable: true,
      render: (a) => {
        const remaining = a.remaining ?? a.allocated - a.taken;
        return (
          <span
            className={`font-bold tabular-nums text-xs px-2.5 py-0.5 rounded-full ${
              remaining > 5
                ? 'bg-emerald-50 text-[#1E7A4C] border border-emerald-200'
                : remaining > 0
                ? 'bg-amber-50 text-[#B4780A] border border-amber-200'
                : 'bg-rose-50 text-[#B23B3B] border border-rose-200'
            }`}
          >
            {remaining} days
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Time Off', href: '/timeoff' },
          { label: 'Leave Allocations' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Leave Allocations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit allowances, taken vacation counts, and remaining balances
          </p>
        </div>

        <Can permission="timeoff:write">
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 h-10 px-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Grant Allocation
          </button>
        </Can>
      </div>

      {/* Pre-filtered Employee Filter Chip */}
      {employeeIdFilter && (
        <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs">
          <span className="text-slate-600 font-medium">Filtered for:</span>
          <span className="font-bold text-[#3B82F6] flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {filterEmployee ? `${filterEmployee.firstName} ${filterEmployee.lastName}` : employeeIdFilter}
          </span>
          <button
            type="button"
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
            className="text-[#3B82F6] font-semibold hover:underline border-l border-blue-200 pl-2 ml-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Profile
          </Link>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredAllocations}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        emptyTitle="No leave allocations granted"
        emptyDescription="Grant leave quotas to employees so they can request time off."
        emptyActionText="Grant Allocation"
        onEmptyAction={handleOpenModal}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">Grant Leave Allocation</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const resolvedEmpId = employeeId || employeeIdFilter || employees[0]?.id;
                const resolvedTypeId = timeOffTypeId || types[0]?.id;
                if (!resolvedEmpId) {
                  alert('Please select an employee.');
                  return;
                }
                if (!resolvedTypeId) {
                  alert('Please select a leave policy.');
                  return;
                }
                createMutation.mutate({
                  employeeId: resolvedEmpId,
                  timeOffTypeId: resolvedTypeId,
                  allocated: Number(allocated) || 0,
                });
              }}
              className="space-y-4 mt-5"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Employee *
                </label>
                <select
                  value={employeeId || (employees[0]?.id ?? '')}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Time Off Policy *
                </label>
                <select
                  value={timeOffTypeId || (types[0]?.id ?? '')}
                  onChange={(e) => setTimeOffTypeId(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233D] mb-1">
                  Allocated Quota (Days / Units) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={allocated}
                  onChange={(e) => setAllocated(Number(e.target.value))}
                  className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] font-semibold tabular-nums"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2F5D82] hover:bg-[#254B68] rounded-lg shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Granting...' : 'Grant Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
