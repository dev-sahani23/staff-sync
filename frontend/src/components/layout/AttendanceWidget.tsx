import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut, X } from 'lucide-react';
import { attendanceApi } from '@/services/attendance';
import { useAuth } from '@/lib/auth-store';

export const AttendanceWidget: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  // Fetch recent attendance for the current employee
  const { data: attendanceList = [] } = useQuery({
    queryKey: ['attendance', 'widget', user?.employeeId],
    queryFn: () => attendanceApi.list({ employeeId: user?.employeeId || undefined }),
    enabled: !!user?.employeeId,
    refetchInterval: 30000,
  });

  // Check if there's an open check-in today without check-out
  const activeSession = React.useMemo(() => {
    return attendanceList.find((a) => a.checkIn && !a.checkOut);
  }, [attendanceList]);

  // Compute live elapsed time
  useEffect(() => {
    if (!activeSession?.checkIn) {
      setElapsed('00:00:00');
      return;
    }

    const timer = setInterval(() => {
      const start = new Date(activeSession.checkIn!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
          seconds
        ).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(user?.employeeId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const isCheckedIn = !!activeSession;

  return (
    <div className="relative">
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-none border-0 ${
          isCheckedIn
            ? 'bg-emerald-100 text-[#10B981]'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={isCheckedIn ? `Checked in: ${elapsed}` : 'Check-in Attendance'}
      >
        <Clock className="w-4 h-4 stroke-[2.2]" />
        {isCheckedIn && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {/* Floating Popup Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg border-2 border-gray-200 shadow-none p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Daily Attendance
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-0.5 rounded"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="my-4 text-center">
            <div className="text-xs text-gray-500 font-semibold">Elapsed Session Duration</div>
            <div className="text-2xl font-bold font-mono tracking-wider text-[#111827] tabular-nums mt-1">
              {isCheckedIn ? elapsed : '00:00:00'}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Status:{' '}
              <span className={`font-bold ${isCheckedIn ? 'text-[#10B981]' : 'text-gray-600'}`}>
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </span>
            </div>
          </div>

          <div>
            {isCheckedIn ? (
              <button
                type="button"
                onClick={() => activeSession && checkOutMutation.mutate(activeSession.id)}
                disabled={checkOutMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-3 bg-[#EF4444] hover:bg-rose-600 text-white rounded-md text-xs font-semibold shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 stroke-[2.2]" />
                {checkOutMutation.isPending ? 'Checking Out...' : 'Check Out Now'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending || !user?.employeeId}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-3 bg-[#10B981] hover:bg-emerald-600 text-white rounded-md text-xs font-semibold shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 stroke-[2.2]" />
                {checkInMutation.isPending ? 'Checking In...' : 'Check In Now'}
              </button>
            )}
            {!user?.employeeId && (
              <p className="text-[10px] text-amber-600 font-medium text-center mt-2">
                No employee profile linked to this account
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
