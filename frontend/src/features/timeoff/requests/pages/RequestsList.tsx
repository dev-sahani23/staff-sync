import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeoffApi } from '@/services/timeoff';
import { employeesApi } from '@/services/employees';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-store';
import { Plus, Check, X, User, ArrowLeft } from 'lucide-react';
import type { LeaveRequest } from '@/types';

export const RequestsList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeIdFilter = searchParams.get('employeeId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [timeOffTypeId, setTimeOffTypeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [duration, setDuration] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['timeoff', 'requests'],
    queryFn: timeoffApi.getRequests,
  });

  const { data: types = [] } = useQuery({
    queryKey: ['timeoff', 'types'],
    queryFn: timeoffApi.getTypes,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const { data: filterEmployee } = useQuery({
    queryKey: ['employee', employeeIdFilter],
    queryFn: () => employeesApi.get(employeeIdFilter!),
    enabled: !!employeeIdFilter,
  });

  // Ensure employeeId is kept in sync with available employees
  useEffect(() => {
    if (!employeeId && employees.length > 0) {
      const matched = user?.employeeId && employees.find((e) => e.id === user.employeeId);
      setEmployeeId(matched ? matched.id : employees[0].id);
    }
  }, [employees, employeeId, user?.employeeId]);

  // Ensure timeOffTypeId is kept in sync with available types
  useEffect(() => {
    if (!timeOffTypeId && types.length > 0) {
      setTimeOffTypeId(types[0].id);
    }
  }, [types, timeOffTypeId]);

  const handleOpenModal = () => {
    const matched = user?.employeeId && employees.find((e) => e.id === user.employeeId);
    const defaultEmp = matched ? matched.id : (employees[0]?.id || '');
    const defaultType = types[0]?.id || '';
    setEmployeeId(defaultEmp);
    setTimeOffTypeId(defaultType);
    setStartDate(new Date().toISOString().substring(0, 10));
    setEndDate(new Date().toISOString().substring(0, 10));
    setDuration(1);
    setNotes('');
    setIsModalOpen(true);
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => timeoffApi.approveRequest(id),
    onSuccess: () => {
      // Invalidate both requests AND allocations so remaining balances update immediately!
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to approve request');
    },
  });

  const refuseMutation = useMutation({
    mutationFn: (id: string) => timeoffApi.refuseRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'requests'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to refuse request');
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<LeaveRequest>) => timeoffApi.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'requests'] });
      setIsModalOpen(false);
      setNotes('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create request');
    },
  });

  const filteredRequests = requests.filter((r) => {
    if (!employeeIdFilter) return true;
    return r.employeeId === employeeIdFilter;
  });

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-[#17233D]">
          {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Current Employee'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Leave Type',
      render: (r) => (
        <span className="text-xs font-medium text-[#2F5D82]">
          {r.timeOffType?.name || 'Annual Leave'}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-600">
          {new Date(r.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-600">
          {new Date(r.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-xs tabular-nums text-slate-800">
          {r.duration} {r.duration === 1 ? 'day' : 'days'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Review Actions',
      align: 'right',
      render: (r) => {
        if (r.status !== 'PENDING') {
          return <span className="text-xs text-slate-400 font-medium">Finalized</span>;
        }
        return (
          <Can permission="timeoff:approve">
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => approveMutation.mutate(r.id)}
                disabled={approveMutation.isPending}
                className="p-1.5 rounded-lg bg-emerald-50 text-[#1E7A4C] hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                title="Approve Request"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => refuseMutation.mutate(r.id)}
                disabled={refuseMutation.isPending}
                className="p-1.5 rounded-lg bg-rose-50 text-[#B23B3B] hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
                title="Refuse Request"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </Can>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Time Off', href: '/timeoff' },
          { label: 'Requests' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Time Off Requests</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Leave applications, manager approval workflow, and balance deduction
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 h-10 px-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Request Leave
        </button>
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
        data={filteredRequests}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No time off requests found"
        emptyDescription="Submit a leave application to start tracking absence schedules."
        emptyActionText="Request Leave"
        onEmptyAction={handleOpenModal}
      />

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">Submit Time Off Request</h3>
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
                const resolvedEmpId =
                  employeeId ||
                  (user?.employeeId && employees.some((emp) => emp.id === user.employeeId)
                    ? user.employeeId
                    : employees[0]?.id);
                const resolvedTypeId = timeOffTypeId || types[0]?.id;

                if (!resolvedEmpId) {
                  alert('Please select a valid employee.');
                  return;
                }
                if (!resolvedTypeId) {
                  alert('Please select a valid leave type.');
                  return;
                }

                createMutation.mutate({
                  employeeId: resolvedEmpId,
                  timeOffTypeId: resolvedTypeId,
                  startDate: new Date(startDate).toISOString(),
                  endDate: new Date(endDate).toISOString(),
                  duration: Number(duration) || 1,
                  notes: notes.trim() || undefined,
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
                  Leave Type *
                </label>
                <select
                  value={timeOffTypeId || (types[0]?.id ?? '')}
                  onChange={(e) => setTimeOffTypeId(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] tabular-nums focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Reason / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional context for approving manager..."
                  className="w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md p-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-10 px-5 text-xs font-bold text-white bg-[#3B82F6] hover:bg-blue-600 rounded-md shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
