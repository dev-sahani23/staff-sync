import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollAPI } from '@/api/api';

export function StructureDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [name, setName] = useState('');
    const [active, setActive] = useState('True');
    const [rules, setRules] = useState<any[]>([]);

    useEffect(() => {
        if (!isNew && id) {
            PayrollAPI.structures.getById(id).then(data => {
                if (data) {
                    setName(data.name);
                    setActive(data.status === 'ACTIVE' ? 'True' : 'False');
                    setRules(data.rules || []);
                }
            }).catch(console.error);
        }
    }, [isNew, id]);

    const handleSave = async () => {
        try {
            if (isNew) {
                await PayrollAPI.structures.create({ name, status: active === 'True' ? 'ACTIVE' : 'INACTIVE' });
                navigate('/payroll/structures');
            } else {
                alert("Editing existing structures is not yet implemented in mock API");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save structure");
        }
    };

    const rulesColumns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Rule Name"
        },
        {
            accessorKey: "code",
            header: "Code"
        },
        {
            accessorKey: "category",
            header: "Category"
        },
        {
            accessorKey: "sequence",
            header: "Sequence"
        }
    ];

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={isNew ? 'New Salary Structure' : `Salary Structure / ${name}`}
                subtitle="Form view configuring its salary rules"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/payroll/structures')} className="h-10 rounded-xl bg-white">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Structure Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Regular Salary"
                            className="h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
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

                <div className="mt-12">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-medium text-blue-600">Salary Rules</h2>
                        <Button variant="outline" className="h-9 px-4 rounded-xl text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Add Rule
                        </Button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <DataTable
                            columns={rulesColumns}
                            data={rules.length > 0 ? rules : [
                                // Stub if new or has no rules just to show wireframe concept
                                { id: 1, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1 },
                                { id: 2, name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', sequence: 10 }
                            ]}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-400 italic">Useful note: rule order matters. Keep sequence visible so participants understand the calculation order. Rules created here is just for reference.</p>
                </div>
            </div>
        </div>
    );
}
