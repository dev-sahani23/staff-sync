import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimeOffAPI, EmployeeAPI } from '@/api/api';

export function AllocationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [employeeId, setEmployeeId] = useState('');
    const [timeOffTypeId, setTimeOffTypeId] = useState('');
    const [allocated, setAllocated] = useState(20);
    const [description, setDescription] = useState('');

    // Read only details from backend
    const [employeeName, setEmployeeName] = useState('');
    const [typeName, setTypeName] = useState('');
    const [approver] = useState('Not Set');
    const [validity] = useState('2026 Annual Balance');
    const [status] = useState('Approved');
    const [taken, setTaken] = useState(0);
    const [remaining, setRemaining] = useState(0);

    const [employees, setEmployees] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);

    useEffect(() => {
        // Load dropdown datas
        EmployeeAPI.getAll().then(setEmployees).catch(console.error);
        TimeOffAPI.types.getAll().then(setTypes).catch(console.error);

        if (!isNew && id) {
            TimeOffAPI.allocations.getAll().then(data => {
                const req = data.find((r: any) => r.id === id);
                if (req) {
                    setEmployeeId(req.employeeId);
                    setTimeOffTypeId(req.timeOffTypeId);
                    setAllocated(req.allocated);
                    setTaken(req.taken || 0);
                    setRemaining(req.remaining || 0);

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
                    allocated: Number(allocated),
                    description
                };
                await TimeOffAPI.allocations.create(payload);
                navigate('/timeoff/allocations');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save allocation");
        }
    };

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={isNew ? 'New Allocation' : `Allocation / ${employeeName || 'Detail'}`}
                subtitle="Form view of one allocation record"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/timeoff/allocations')} className="h-10 rounded-xl bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {isNew && (
                            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        )}
                        {!isNew && (
                            <>
                                <Button className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                    Approve
                                </Button>
                                <Button variant="outline" className="h-10 px-6 rounded-xl shadow-none">
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
                        <label className="block text-sm font-medium text-slate-500 mb-2">Taken</label>
                        <Input readOnly value={isNew ? '0 Days' : `${taken} Days`} className="h-11 rounded-xl bg-slate-50" />
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
                        <label className="block text-sm font-medium text-slate-500 mb-2">Remaining</label>
                        <Input readOnly value={isNew ? `${allocated} Days` : `${remaining} Days`} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Allocated</label>
                        <Input
                            type="number"
                            value={allocated}
                            onChange={e => setAllocated(Number(e.target.value))}
                            readOnly={!isNew}
                            className={`h-11 rounded-xl ${!isNew ? 'bg-slate-50' : ''}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Approver</label>
                        <Input readOnly value={approver} className="h-11 rounded-xl bg-slate-50 text-slate-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Status</label>
                        <Input readOnly value={status} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Validity</label>
                        <Input readOnly value={validity} className="h-11 rounded-xl bg-slate-50 text-slate-500" />
                    </div>
                </div>

                <div className="mt-8">
                    <label className="block text-sm font-medium text-slate-500 mb-2">Description</label>
                    <textarea
                        className={`w-full border border-slate-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isNew ? 'bg-slate-50 text-slate-700' : ''}`}
                        placeholder="Annual leave balance granted at start of policy year."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        readOnly={!isNew}
                    />
                    <p className="mt-2 text-sm text-slate-400 italic">Useful note: approved allocation is what creates available leave balance for the employee.</p>
                </div>
            </div>
        </div>
    );
}
