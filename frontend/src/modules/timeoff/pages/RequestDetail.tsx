import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimeOffAPI, EmployeeAPI } from '@/api/api';

export function RequestDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [employeeId, setEmployeeId] = useState('');
    const [timeOffTypeId, setTimeOffTypeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [duration, setDuration] = useState(1);
    const [status, setStatus] = useState('PENDING');
    const [reason, setReason] = useState('');

    // Read only details from backend
    const [employeeName, setEmployeeName] = useState('');
    const [typeName, setTypeName] = useState('');
    const [approver] = useState('Not Set');
    const [allocationUsed] = useState('Calculated Automatically');

    const [employees, setEmployees] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);

    useEffect(() => {
        // Load dropdown datas
        EmployeeAPI.getAll().then(setEmployees).catch(console.error);
        TimeOffAPI.types.getAll().then(setTypes).catch(console.error);

        if (!isNew && id) {
            // Because we don't have getById for requests implemented yet, we use getAll and find..
            TimeOffAPI.requests.getAll().then(data => {
                const req = data.find((r: any) => r.id === id);
                if (req) {
                    setEmployeeId(req.employeeId);
                    setTimeOffTypeId(req.timeOffTypeId);
                    setStartDate(new Date(req.startDate).toISOString().split('T')[0]);
                    setEndDate(new Date(req.endDate).toISOString().split('T')[0]);
                    setDuration(req.duration);
                    setStatus(req.status);
                    setReason(req.reason || '');

                    setEmployeeName(req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : '');
                    setTypeName(req.timeOffType?.name || '');
                }
            }).catch(console.error);
        }
    }, [isNew, id]);

    const handleSave = async () => {
        try {
            if (isNew) {
                const payload = {
                    employeeId,
                    timeOffTypeId,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    duration: Number(duration),
                    reason
                };
                await TimeOffAPI.requests.create(payload);
                navigate('/timeoff/requests');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save request");
        }
    };

    const handleApprove = async () => {
        try {
            await TimeOffAPI.requests.approve(id as string);
            setStatus('APPROVED');
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed");
        }
    };

    const handleRefuse = async () => {
        try {
            await TimeOffAPI.requests.refuse(id as string);
            setStatus('REFUSED');
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed");
        }
    };

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={isNew ? 'New Time Off Request' : `Time Off Request / ${employeeName || 'Detail'}`}
                subtitle="Form view of one request"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/timeoff/requests')} className="h-10 rounded-xl bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {isNew && (
                            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        )}
                        {!isNew && status === 'PENDING' && (
                            <>
                                <Button onClick={handleApprove} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                    Approve
                                </Button>
                                <Button onClick={handleRefuse} variant="outline" className="h-10 px-6 rounded-xl shadow-none">
                                    Refuse
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Employee</label>
                        {isNew ? (
                            <select
                                className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                                value={employeeId}
                                onChange={e => setEmployeeId(e.target.value)}
                            >
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        ) : (
                            <Input readOnly value={employeeName} className="h-11 rounded-xl bg-slate-50" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Duration</label>
                        {isNew ? (
                            <div className="flex items-center gap-2">
                                <Input type="number" min="0.5" step="0.5" value={duration} onChange={e => setDuration(Number(e.target.value))} className="h-11 rounded-xl" />
                                <span className="text-slate-500 text-sm">Days</span>
                            </div>
                        ) : (
                            <Input readOnly value={`${duration} Days`} className="h-11 rounded-xl bg-slate-50" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Time Off Type</label>
                        {isNew ? (
                            <select
                                className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                                value={timeOffTypeId}
                                onChange={e => setTimeOffTypeId(e.target.value)}
                            >
                                <option value="">Select Type...</option>
                                {types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        ) : (
                            <Input readOnly value={typeName} className="h-11 rounded-xl bg-slate-50" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Status</label>
                        <Input readOnly value={status} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Start Date</label>
                        <Input
                            type={isNew ? "date" : "text"}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            readOnly={!isNew}
                            className={`h-11 rounded-xl ${!isNew ? 'bg-slate-50' : ''}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Approver</label>
                        <Input readOnly value={approver} className="h-11 rounded-xl bg-slate-50 text-slate-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">End Date</label>
                        <Input
                            type={isNew ? "date" : "text"}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            readOnly={!isNew}
                            className={`h-11 rounded-xl ${!isNew ? 'bg-slate-50' : ''}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Allocation Used</label>
                        <Input readOnly value={allocationUsed} className="h-11 rounded-xl bg-slate-50 text-slate-500" />
                    </div>
                </div>

                <div className="mt-8">
                    <label className="block text-sm font-medium text-slate-500 mb-2">Reason</label>
                    <textarea
                        className={`w-full border border-slate-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isNew ? 'bg-slate-50 text-slate-700' : ''}`}
                        placeholder="Family vacation..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        readOnly={!isNew}
                    />
                    <p className="mt-2 text-sm text-slate-400 italic">Useful note: if the selected type requires allocation, the request should clearly show which balance was consumed.</p>
                </div>
            </div>
        </div>
    );
}
