import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { EmployeeAPI } from '@/api/api';

export function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Fallback static template to reset forms against reliably
    const initialTemplate = {
        id: '', name: '', email: '', initials: '', role: '', department: '', status: 'Active', phone: '', manager: '', schedule: '', location: '', company: ''
    };
    const [employee, setEmployee] = useState<any>(null);

    useEffect(() => {
        if (!id || isNew) return;
        EmployeeAPI.getById(id).then(setEmployee).catch(console.error);
    }, [id, isNew]);

    const [isEditing, setIsEditing] = useState(isNew);
    const [formData, setFormData] = useState<any>(isNew ? initialTemplate : employee);

    useEffect(() => {
        if (employee) setFormData(employee);
    }, [employee]);

    if (!isNew && !formData) return <div className="p-12 text-slate-500 font-medium">Loading employee metrics...</div>;

    const handleSave = () => {
        if (isNew) {
            // Generate arbitrary mock id internally and route immediately after API resolution
            EmployeeAPI.create(formData)
                .then(() => navigate('/dashboard'))
                .catch(console.error);
        } else {
            // Update flow skipped intentionally - would map to API as well
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (isNew) {
            navigate('/dashboard');
        } else {
            setFormData(employee || initialTemplate);
            setIsEditing(false);
        }
    };

    return (
        <div className="w-full font-sans pb-12 max-w-[1000px]">
            <PageHeader
                title={isNew ? "Create New Employee" : `Employee / ${formData.name}`}
                subtitle={isNew ? "Fill in the details to onboard a new employee" : "Main employee form with related HR actions"}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-10 -mt-2">
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="px-6 rounded-xl text-slate-600 border-slate-200 uppercase text-[11px] tracking-wider font-semibold shadow-sm h-9">
                        EDIT
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={isNew && !formData.name} className="px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 uppercase text-[11px] tracking-wider font-semibold shadow-sm h-9">
                            SAVE
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="px-6 rounded-xl text-slate-600 border-slate-200 uppercase text-[11px] tracking-wider font-semibold shadow-sm h-9">
                            CANCEL
                        </Button>
                    </div>
                )}
                {!isNew && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-9 text-sm px-4">Time Off 3</Button>
                        <Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-9 text-sm px-4">Contracts 2</Button>
                        <Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-9 text-sm px-4">Attendance 14</Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-5 mb-14">
                <div className="w-[104px] h-[104px] bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-center text-3xl text-blue-700 font-medium shrink-0 shadow-sm">
                    {isNew ? (formData.name ? formData.name.charAt(0).toUpperCase() : '?') : formData.initials}
                </div>
                {!isNew ? (
                    <div>
                        <h2 className="text-[26px] font-medium text-slate-800 mb-1 leading-tight tracking-tight">{formData.name}</h2>
                        <p className="text-slate-500 mb-2 mt-1 text-[15px]">{formData.role || 'No Role'}<span className="mx-2">•</span>{formData.department || 'No Department'}</p>
                        <p className="text-slate-500 text-[13px]">{formData.email || 'No Email'}<span className="mx-2">|</span>{formData.phone || 'No Phone'}</p>
                    </div>
                ) : (
                    <div className="w-full max-w-sm ml-4">
                        <FormField label="Full Name" value={formData.name} isEditing={true} onChange={(v) => setFormData({ ...formData, name: v })} />
                    </div>
                )}
            </div>

            <Tabs defaultValue="work" className="w-full">
                <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start h-auto p-0 rounded-none mb-10 gap-8">
                    <TabsTrigger value="work" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 py-2.5 text-slate-500 hover:text-slate-700 font-medium text-[15px]">
                        Work Information
                    </TabsTrigger>
                    <TabsTrigger value="private" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 py-2.5 text-slate-500 hover:text-slate-700 font-medium text-[15px]">
                        Private Information
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="work" className="outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-7">
                        <FormField label="Department" value={formData.department} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, department: v })} />
                        <FormField label="Job Position" value={formData.role} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, role: v })} />
                        <FormField label="Manager" value={formData.manager} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, manager: v })} />
                        <FormField label="Work Location" value={formData.location} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, location: v })} />
                        <FormField label="Working Schedule" value={formData.schedule} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, schedule: v })} />
                        <FormField label="Status" value={formData.status} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, status: v })} />
                        <FormField label="Company" value={formData.company} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, company: v })} />
                        <FormField label="Work Email" value={formData.email} isEditing={isEditing} onChange={(v) => setFormData({ ...formData, email: v })} />
                    </div>
                </TabsContent>
                <TabsContent value="private" className="outline-none">
                    <p className="text-slate-500 text-sm">Private information is secured and hidden.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function FormField({ label, value, isEditing, onChange }: { label: string, value?: string, isEditing?: boolean, onChange?: (val: string) => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-slate-600 text-sm w-36 whitespace-nowrap">{label}</span>
            <Input
                readOnly={!isEditing}
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                className={`bg-white border text-sm flex-1 rounded-xl h-10 shadow-sm outline-none focus-visible:ring-0 focus-visible:border-blue-400 transition-colors ${!isEditing ? 'text-slate-800 border-transparent sm:border-slate-200 cursor-default shadow-none pointer-events-none' : 'text-slate-900 border-slate-300'}`}
            />
        </div>
    )
}
