import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { schedulesApi } from '@/services/schedules';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { Calendar, Plus, Clock } from 'lucide-react';
import type { WorkingSchedule } from '@/types';

export const SchedulesList: React.FC = () => {
  const navigate = useNavigate();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: schedulesApi.list,
  });

  const columns: Column<WorkingSchedule>[] = [
    {
      key: 'name',
      header: 'Schedule Name',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2 font-semibold text-[#17233D]">
          <Calendar className="w-4 h-4 text-[#2F5D82]" />
          <span>{s.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Working Type',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {s.type || 'FULL_TIME'}
        </span>
      ),
    },
    {
      key: 'days',
      header: 'Working Days / Week',
      render: (s) => (
        <span className="text-xs text-slate-600">
          {s.lines?.length || 5} days/week
        </span>
      ),
    },
    {
      key: 'weeklyHours',
      header: 'Total Weekly Hours',
      align: 'right',
      render: (s) => {
        // Calculate weekly hours
        let total = 0;
        if (s.lines && s.lines.length > 0) {
          for (const l of s.lines) {
            const [sh, sm] = l.startTime.split(':').map(Number);
            const [eh, em] = l.endTime.split(':').map(Number);
            const minutes = eh * 60 + em - (sh * 60 + sm) - (l.breakMinutes || 0);
            total += Math.max(0, minutes / 60);
          }
        } else {
          total = 40; // Default Standard
        }
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#2F5D82] bg-[#EAF1F6] px-2.5 py-0.5 rounded-full tabular-nums">
            <Clock className="w-3 h-3" />
            {total.toFixed(1)} hrs/week
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'HR', href: '/employees' },
          { label: 'Working Schedules' },
        ]}
      />

      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Working Schedules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard working calendars, daily shifts, and baseline contracted hours
          </p>
        </div>

        <Can permission="schedules:write">
          <button
            onClick={() => navigate('/schedules/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] text-white text-xs font-semibold rounded-lg hover:bg-[#254B68] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={schedules}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/schedules/${s.id}`)}
        isLoading={isLoading}
        emptyTitle="No working schedules found"
        emptyDescription="Define working schedules to allocate hours for attendance and payroll computation."
      />
    </div>
  );
};
