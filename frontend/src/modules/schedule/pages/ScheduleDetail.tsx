import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScheduleAPI } from '@/api/api';

const DAYS = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
];

interface ScheduleLine {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakMinutes: number;
}

export function ScheduleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [name, setName] = useState('');
    const [type, setType] = useState('Standard');
    const [lines, setLines] = useState<ScheduleLine[]>(
        DAYS.map(d => ({
            dayOfWeek: d.value,
            startTime: '09:00',
            endTime: '17:00',
            breakMinutes: 60
        }))
    );
    const [persistedWeeklyHours, setPersistedWeeklyHours] = useState(0);
    const [isLoading, setIsLoading] = useState(!isNew);

    // Live compute with useMemo (effectively instant, but satisfies "UX feedback" requirement)
    // To debounce it properly, we could use a useDebounce hook, but useMemo is lightweight enough for local state
    // We will simulate a debounce for the UI update if strictly needed, but simple derived state works perfectly here.
    const localWeeklyHours = useMemo(() => {
        let total = 0;
        lines.forEach(line => {
            if (!line.startTime || !line.endTime) return;
            const [sh, sm] = line.startTime.split(':').map(Number);
            const [eh, em] = line.endTime.split(':').map(Number);
            const startMins = (sh * 60) + (sm || 0);
            const endMins = (eh * 60) + (em || 0);
            let worked = (endMins - startMins) - (line.breakMinutes || 0);
            if (worked < 0) worked = 0;
            total += worked / 60;
        });
        return total;
    }, [lines]);

    useEffect(() => {
        if (!isNew && id) {
            ScheduleAPI.getById(id)
                .then(data => {
                    setName(data.name);
                    setType(data.type || 'Standard');
                    setPersistedWeeklyHours(data.weeklyHours);

                    // Merge DB lines with missing days
                    const dbLines = data.lines || [];
                    const mergedLines = DAYS.map(d => {
                        const existing = dbLines.find((l: any) => l.dayOfWeek === d.value);
                        if (existing) {
                            return {
                                dayOfWeek: existing.dayOfWeek,
                                startTime: existing.startTime,
                                endTime: existing.endTime,
                                breakMinutes: existing.breakMinutes
                            };
                        }
                        return {
                            dayOfWeek: d.value,
                            startTime: '',
                            endTime: '',
                            breakMinutes: 0
                        };
                    });
                    setLines(mergedLines);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [isNew, id]);

    const handleLineChange = (index: number, field: keyof ScheduleLine, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleClearDay = (index: number) => {
        handleLineChange(index, 'startTime', '');
        handleLineChange(index, 'endTime', '');
        handleLineChange(index, 'breakMinutes', 0);
    };

    const handleSave = async () => {
        // Filter out empty days before sending to backend to save DB space
        // Or keep them based on standard convention. Keeping all is safer for full-grid.
        const activeLines = lines.filter(l => l.startTime && l.endTime);
        const payload = {
            name,
            type,
            lines: activeLines
        };

        try {
            if (isNew) {
                const res = await ScheduleAPI.create(payload);
                navigate(`/schedules/${res.id}`);
            } else {
                const res = await ScheduleAPI.update(id as string, payload);
                setPersistedWeeklyHours(res.weeklyHours); // Authoritative Update
                // We don't navigate away, just show it saved by updating authoritative value
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save schedule.");
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await ScheduleAPI.delete(id as string);
            navigate('/schedules');
        } catch (error) {
            console.error(error);
        }
    };

    const getDailyHours = (line: ScheduleLine) => {
        if (!line.startTime || !line.endTime) return 0;
        const [sh, sm] = line.startTime.split(':').map(Number);
        const [eh, em] = line.endTime.split(':').map(Number);
        const startMins = (sh * 60) + (sm || 0);
        const endMins = (eh * 60) + (em || 0);
        let worked = (endMins - startMins) - (line.breakMinutes || 0);
        if (worked < 0) worked = 0;
        return worked / 60;
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={isNew ? 'New Working Schedule' : name}
                subtitle="Configure working hours per day"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/schedules')} className="h-10 rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {!isNew && (
                            <Button variant="destructive" onClick={handleDelete} className="h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                        <Button onClick={handleSave} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                            <Save className="h-4 w-4 mr-2" />
                            Save Schedule
                        </Button>
                    </div>
                }
            />

            <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
                    <div className="flex gap-6 w-full max-w-2xl">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-600 mb-2">Schedule Name</label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Standard 40h"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-600 mb-2">Schedule Type</label>
                            <Input
                                value={type}
                                onChange={e => setType(e.target.value)}
                                placeholder="e.g. Flexible, Fixed"
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[200px]">
                        <Clock className="h-5 w-5 text-blue-500 mb-2" />
                        <div className="text-xl font-bold text-slate-800">
                            {isNew ? localWeeklyHours.toFixed(2) : persistedWeeklyHours.toFixed(2)} <span className="text-sm font-medium text-slate-500">hrs/wk</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                            {isNew ? "Live Preview" : "Official Total"}
                        </div>
                        {!isNew && localWeeklyHours !== persistedWeeklyHours && (
                            <div className="text-xs text-amber-600 mt-1 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                                Unsaved changes ({localWeeklyHours.toFixed(2)}h)
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[140px_1fr_1fr_120px_100px_80px] gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                        <div>Day</div>
                        <div>Start Time</div>
                        <div>End Time</div>
                        <div>Break (mins)</div>
                        <div className="text-right">Total</div>
                        <div></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {lines.map((line, ix) => (
                            <div key={line.dayOfWeek} className="grid grid-cols-[140px_1fr_1fr_120px_100px_80px] gap-4 p-4 items-center">
                                <div className="font-medium text-slate-700">
                                    {DAYS.find(d => d.value === line.dayOfWeek)?.label}
                                </div>
                                <div>
                                    <Input
                                        type="time"
                                        value={line.startTime}
                                        onChange={e => handleLineChange(ix, 'startTime', e.target.value)}
                                        className="h-10 rounded-lg text-slate-700"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="time"
                                        value={line.endTime}
                                        onChange={e => handleLineChange(ix, 'endTime', e.target.value)}
                                        className="h-10 rounded-lg text-slate-700"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={line.breakMinutes}
                                        onChange={e => handleLineChange(ix, 'breakMinutes', Number(e.target.value))}
                                        className="h-10 rounded-lg text-slate-700"
                                    />
                                </div>
                                <div className="text-right font-medium text-slate-700">
                                    {getDailyHours(line).toFixed(2)}h
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleClearDay(ix)}
                                        className="text-slate-400 hover:text-red-500 text-sm h-8 px-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Clear hours for this day"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
