import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AttendanceAPI } from '@/api/api';
import { useEffect, useState } from 'react';

export function AttendanceDetail() {
    const { id } = useParams();
    const [record, setRecord] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        AttendanceAPI.getById(id).then(setRecord).catch(console.error);
    }, [id]);

    if (!record) return <div className="p-12 text-slate-500 font-medium">Loading attendance record...</div>;

    return (
        <div className="w-full font-sans pb-12 max-w-[1000px]">
            <PageHeader
                title={`Attendance / ${record.employeeName} / ${record.dateTitle}`}
                subtitle="Form view of one attendance record"
                actions={
                    <Button variant="outline" className="px-6 rounded-xl text-slate-600 border-slate-200 uppercase text-[11px] tracking-wider font-semibold shadow-sm h-9">
                        EDIT
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-7 mt-8">
                <FormField label="Employee" value={record.employeeName} />
                <FormField label="Department" value={record.department} />
                <FormField label="Check In" value={record.checkIn} />
                <FormField label="Manager" value={record.manager} />
                <FormField label="Check Out" value={record.checkOut} />
                <FormField label="Status" value={record.status} />
                <FormField label="Worked Hours" value={record.workedHours} />
                <FormField label="Overtime" value={record.overtime} />
            </div>

            <div className="mt-14 border border-slate-200 rounded-2xl p-8 bg-white/50">
                <h3 className="text-slate-600 text-[15px] mb-3">Notes</h3>
                <p className="text-slate-800 text-[15px]">{record.notes}</p>
            </div>

            <p className="mt-8 text-slate-500 text-sm">
                Useful note: worked hours and overtime should be easy to read because they may later influence payroll or reporting.
            </p>
        </div>
    );
}

function FormField({ label, value }: { label: string, value?: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-slate-600 text-[15px] w-36 whitespace-nowrap leading-tight">{label}</span>
            <Input
                readOnly
                value={value || ''}
                className="bg-white border-slate-200 text-[15px] flex-1 rounded-xl h-10 shadow-sm outline-none focus-visible:ring-0 focus-visible:border-blue-400 transition-colors text-slate-900"
            />
        </div>
    );
}
