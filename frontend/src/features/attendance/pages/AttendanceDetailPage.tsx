import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/services/attendance';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Can } from '@/lib/permissions';
import { Save, AlertCircle } from 'lucide-react';
import type { Attendance, AttendanceStatus } from '@/types';

export const AttendanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: attendanceList = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.list(),
  });

  const record = attendanceList.find((a) => a.id === id);

  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [workedHours, setWorkedHours] = useState<number>(8);
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [correctionNotes, setCorrectionNotes] = useState('');

  useEffect(() => {
    if (record) {
      setCheckInTime(record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00');
      setCheckOutTime(record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '18:00');
      setWorkedHours(record.workedHours || 8);
      setStatus(record.status);
      setCorrectionNotes(record.correctionNotes || '');
    }
  }, [record]);

  const correctMutation = useMutation({
    mutationFn: (payload: Partial<Attendance>) => attendanceApi.correct(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      alert('Attendance record corrected successfully.');
      navigate('/attendance');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to correct record');
    },
  });

  if (isLoading || !record) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Attendance', href: '/attendance' },
          { label: `Entry ${new Date(record.date).toLocaleDateString()}` },
        ]}
      />

      <div className="bg-white border border-[#DDE3EC] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE3EC]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-[#17233D]">
                Attendance Entry — {new Date(record.date).toLocaleDateString()}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee:{' '}
              <span className="font-semibold text-[#2F5D82]">
                {record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Current User'}
              </span>
            </p>
          </div>

          <Can permission="attendance:write">
            <button
              onClick={() =>
                correctMutation.mutate({
                  workedHours: Number(workedHours),
                  status,
                  correctionNotes,
                })
              }
              disabled={correctMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] hover:bg-[#254B68] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {correctMutation.isPending ? 'Saving...' : 'Save Correction'}
            </button>
          </Can>
        </div>

        {record.correctedBy && (
          <div className="my-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#B4780A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Manually corrected entry by{' '}
              <span className="font-semibold">{record.correctedBy}</span>.
            </span>
          </div>
        )}

        <form className="space-y-4 my-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Check In Time
              </label>
              <input
                type="text"
                disabled
                value={checkInTime}
                className="w-full text-xs border border-[#DDE3EC] bg-slate-50 rounded-lg p-2 text-slate-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Check Out Time
              </label>
              <input
                type="text"
                disabled
                value={checkOutTime}
                className="w-full text-xs border border-[#DDE3EC] bg-slate-50 rounded-lg p-2 text-slate-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Calculated Worked Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={workedHours}
                onChange={(e) => setWorkedHours(Number(e.target.value))}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="ABSENT">ABSENT</option>
                <option value="CORRECTED">CORRECTED</option>
                <option value="EXCEPTION">EXCEPTION</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17233D] mb-1">
              Correction Notes / Reason
            </label>
            <textarea
              rows={3}
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              placeholder="e.g. Employee forgot to clock out before off-site customer visit"
              className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
