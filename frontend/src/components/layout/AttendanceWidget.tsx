import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/components/AuthContext';

interface AttendanceWidgetProps {
    onClose: () => void;
}

export function AttendanceWidget({ onClose }: AttendanceWidgetProps) {
    const { user } = useAuth();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [nowTime, setNowTime] = useState<Date>(new Date());

    // Simulate updating elapsed time every minute dynamically for visual feedback
    useEffect(() => {
        if (!isCheckedIn) return;
        const timer = setInterval(() => setNowTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [isCheckedIn]);

    const handleAction = () => {
        if (!isCheckedIn) {
            setStartTime(new Date());
            setNowTime(new Date());
            setIsCheckedIn(true);
        } else {
            setIsCheckedIn(false);
            setStartTime(null);
        }
    };

    const formatTime = (d: Date | null) => {
        if (!d) return '--:--';
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const getElapsed = () => {
        if (!startTime) return '0h00';
        const diff = nowTime.getTime() - startTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hrs}h${mins.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute right-0 top-12 w-[320px] bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden font-sans animation-in slide-in-from-top-2">
            {/* Header */}
            <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
                <span className="text-blue-600 font-medium text-[15px]">Attendance Widget</span>
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <div
                        onClick={handleAction}
                        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer text-white font-bold text-[10px] ${isCheckedIn ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        C
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <p className="text-slate-500 text-sm mb-0.5">Welcome back</p>
                <h3 className="text-xl font-medium text-slate-800 mb-6">{user?.name || 'User Name'}!</h3>

                <div className="flex items-center justify-between text-slate-600 text-[15px] mb-4">
                    <div className="flex items-center gap-[22px]">
                        <span>{isCheckedIn ? formatTime(startTime) : '--:--'}</span>
                        <span className="text-slate-300">—</span>
                        <span>Now</span>
                    </div>
                    <span className="font-medium text-slate-700">{getElapsed()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-[15px] mb-6 pt-4 border-t border-slate-100">
                    <span>Today</span>
                    <span className="font-medium text-slate-700">{getElapsed()}</span>
                </div>

                <Button
                    onClick={handleAction}
                    className={`w-full h-11 rounded-lg text-white font-medium text-[15px] shadow-sm ${isCheckedIn ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isCheckedIn ? 'Check Out' : 'Check In'}
                </Button>
            </div>
        </div>
    );
}
