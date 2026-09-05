import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '@/services/schedules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import type { ScheduleLine } from '@/types';

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const ScheduleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [name, setName] = useState('Standard 40h Work Week');
  const [type, setType] = useState('FULL_TIME');
  const [lines, setLines] = useState<Array<Omit<ScheduleLine, 'id' | 'workingScheduleId'>>>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
  ]);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => schedulesApi.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (schedule) {
      setName(schedule.name);
      setType(schedule.type || 'FULL_TIME');
      if (schedule.lines && schedule.lines.length > 0) {
        setLines(
          schedule.lines.map((l) => ({
            dayOfWeek: l.dayOfWeek,
            startTime: l.startTime,
            endTime: l.endTime,
            breakMinutes: l.breakMinutes,
          }))
        );
      }
    }
  }, [schedule]);

  // Compute daily hours helper
  const calculateDailyHours = (startTime: string, endTime: string, breakMinutes: number) => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm) - (breakMinutes || 0);
      return Math.max(0, minutes / 60);
    } catch {
      return 0;
    }
  };

  // Client-computed total weekly hours kept in sync as rows change
  const totalWeeklyHours = lines.reduce((acc, l) => {
    return acc + calculateDailyHours(l.startTime, l.endTime, l.breakMinutes);
  }, 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        type,
        lines: lines as any,
      };
      if (isNew) {
        return schedulesApi.create(payload);
      } else {
        return schedulesApi.update(id!, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      alert('Working schedule saved successfully.');
      navigate('/schedules');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to save schedule');
    },
  });

  const handleAddDay = () => {
    const nextDay = (lines.length % 7) + 1;
    setLines([
      ...lines,
      { dayOfWeek: nextDay, startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  if (!isNew && isLoading) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Working Schedules', href: '/schedules' },
          { label: isNew ? 'New Schedule' : name },
        ]}
      />

      <div className="bg-white border border-[#DDE3EC] rounded-2xl p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE3EC]">
          <div>
            <h1 className="text-xl font-bold text-[#17233D]">
              {isNew ? 'Create Working Schedule' : name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly shift pattern and total contracted work hours
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Prominently displayed client-computed total weekly hours */}
            <div className="bg-[#EAF1F6] border border-[#2F5D82]/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2F5D82]" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Weekly Hours
                </div>
                <div className="text-lg font-bold text-[#2F5D82] tabular-nums">
                  {totalWeeklyHours.toFixed(1)} hrs/week
                </div>
              </div>
            </div>

            <Can permission="schedules:write">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] hover:bg-[#254B68] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Schedule'}
              </button>
            </Can>
          </div>
        </div>

        {/* Schedule Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div>
            <label className="block text-xs font-semibold text-[#17233D] mb-1">
              Schedule Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17233D] mb-1">
              Working Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
            >
              <option value="FULL_TIME">FULL_TIME (Full Time Employee)</option>
              <option value="PART_TIME">PART_TIME (Part Time Employee)</option>
              <option value="SHIFT">SHIFT (Rotational Shift)</option>
            </select>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#17233D]">Weekly Pattern Grid</h3>
            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F5D82] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Day
            </button>
          </div>

          <div className="border border-[#DDE3EC] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE3EC] text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Day of Week</th>
                  <th className="py-2.5 px-4">Start Time</th>
                  <th className="py-2.5 px-4">End Time</th>
                  <th className="py-2.5 px-4">Break (Mins)</th>
                  <th className="py-2.5 px-4 text-right">Daily Hours</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC]">
                {lines.map((line, idx) => {
                  const daily = calculateDailyHours(line.startTime, line.endTime, line.breakMinutes);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-4">
                        <select
                          value={line.dayOfWeek}
                          onChange={(e) =>
                            handleLineChange(idx, 'dayOfWeek', Number(e.target.value))
                          }
                          className="border border-[#DDE3EC] rounded-md p-1.5 text-xs bg-white outline-none"
                        >
                          {DAY_NAMES.map((dn, di) => (
                            <option key={di} value={di + 1}>
                              {dn}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="time"
                          value={line.startTime}
                          onChange={(e) => handleLineChange(idx, 'startTime', e.target.value)}
                          className="border border-[#DDE3EC] rounded-md p-1.5 text-xs bg-white outline-none"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="time"
                          value={line.endTime}
                          onChange={(e) => handleLineChange(idx, 'endTime', e.target.value)}
                          className="border border-[#DDE3EC] rounded-md p-1.5 text-xs bg-white outline-none"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="0"
                          step="15"
                          value={line.breakMinutes}
                          onChange={(e) =>
                            handleLineChange(idx, 'breakMinutes', Number(e.target.value))
                          }
                          className="w-20 border border-[#DDE3EC] rounded-md p-1.5 text-xs bg-white outline-none tabular-nums"
                        />
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-[#2F5D82] tabular-nums">
                        {daily.toFixed(1)} hrs
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(idx)}
                          className="p-1 text-slate-400 hover:text-[#B23B3B] transition-colors"
                          title="Remove Day"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
