import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/services/attendance';
import { employeesApi } from '@/services/employees';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { User, X, ArrowLeft } from 'lucide-react';
import type { Attendance } from '@/types';

export const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeIdFilter = searchParams.get('employeeId');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance', employeeIdFilter],
    queryFn: () => attendanceApi.list({ employeeId: employeeIdFilter || undefined }),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', employeeIdFilter],
    queryFn: () => employeesApi.get(employeeIdFilter!),
    enabled: !!employeeIdFilter,
  });

  const filteredAttendance = attendance.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const columns: Column<Attendance>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (a) => (
        <span className="font-semibold text-[#17233D]">
          {new Date(a.date).toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (a) => (
        <span className="text-xs font-medium text-[#2F5D82]">
          {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Current User'}
        </span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (a) => (
        <span className="text-xs text-slate-700 font-mono">
          {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (a) => (
        <span className="text-xs text-slate-700 font-mono">
          {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      key: 'workedHours',
      header: 'Worked Hours',
      align: 'right',
      sortable: true,
      render: (a) => (
        <span className="text-xs font-bold text-[#17233D] tabular-nums">
          {a.workedHours != null ? `${a.workedHours.toFixed(1)} hrs` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={a.status} />
          {a.correctedBy && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
              Corrected
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'HR', href: '/employees' },
          { label: 'Attendance Records' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily employee clock-in entries, worked hours calculations, and adjustments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-[#DDE3EC] rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#2F5D82]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
            <option value="LATE">LATE</option>
            <option value="CORRECTED">CORRECTED</option>
            <option value="EXCEPTION">EXCEPTION</option>
          </select>
        </div>
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
        data={filteredAttendance}
        keyExtractor={(a) => a.id}
        onRowClick={(a) => navigate(`/attendance/${a.id}`)}
        isLoading={isLoading}
        emptyTitle="No attendance records found"
        emptyDescription="Records appear as personnel check in using the floating attendance widget."
      />
    </div>
  );
};
