import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimeOffAPI } from '@/api/api';

export function TimeOffTypeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [name, setName] = useState('');
    const [requiresAllocation, setRequiresAllocation] = useState(true);

    // Mocks based on wireframe
    const [unit, setUnit] = useState('Days');
    const [approval, setApproval] = useState('Manager');
    const [active, setActive] = useState('True');
    const [payrollEntry, setPayrollEntry] = useState('Leave Work Entry');
    const [color, setColor] = useState('Blue');

    useEffect(() => {
        if (!isNew && id) {
            TimeOffAPI.types.getAll().then(data => {
                const req = data.find((r: any) => r.id === id);
                if (req) {
                    setName(req.name);
                    setRequiresAllocation(req.requiresAllocation);
                }
            }).catch(console.error);
        }
    }, [isNew, id]);

    const handleSave = async () => {
        try {
            if (isNew) {
                const payload = {
                    name,
                    requiresAllocation,
                    color: '#3B82F6'
                };
                await TimeOffAPI.types.create(payload);
                navigate('/timeoff/types');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save time off type");
        }
    };

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={isNew ? 'New Time Off Type' : `Time Off Type / ${name}`}
                subtitle="Form view of one time off type"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/timeoff/types')} className="h-10 rounded-xl bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                }
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-5xl">
                {!isNew && (
                    <Button variant="outline" className="mb-8 rounded-xl font-medium uppercase tracking-wider text-xs">
                        Edit
                    </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Type Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Paid Time Off"
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Approval</label>
                        <Input
                            value={approval}
                            onChange={e => setApproval(e.target.value)}
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Unit</label>
                        <Input
                            value={unit}
                            onChange={e => setUnit(e.target.value)}
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Payroll / Work Entry</label>
                        <Input
                            value={payrollEntry}
                            onChange={e => setPayrollEntry(e.target.value)}
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Requires Allocation</label>
                        <select
                            className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                            value={requiresAllocation ? 'Yes' : 'No'}
                            onChange={e => setRequiresAllocation(e.target.value === 'Yes')}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Display Color</label>
                        <Input
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Active</label>
                        <Input
                            value={active}
                            onChange={e => setActive(e.target.value)}
                            className="h-11 rounded-xl"
                        />
                    </div>
                </div>

                <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Configuration Notes</label>
                    <p className="text-slate-700 text-[15px]">Standard annual leave. Balance comes from approved allocations.</p>
                </div>
                <p className="mt-3 text-sm text-slate-400 italic">Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.</p>
            </div>
        </div>
    );
}
