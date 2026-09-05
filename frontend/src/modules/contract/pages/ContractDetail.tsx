import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { ContractAPI } from '@/api/api';
import { useEffect, useState } from 'react';

export function ContractDetail() {
    const { id } = useParams();
    const [contract, setContract] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        ContractAPI.getById(id).then(setContract).catch(console.error);
    }, [id]);

    if (!contract) return <div className="p-12 text-slate-500 font-medium">Loading contract metrics...</div>;

    return (
        <div className="w-full font-sans pb-12 max-w-[1000px]">
            <PageHeader
                title={`Contract / ${contract.contractCode}`}
                subtitle="Form view of one contract"
            />

            <div className="mt-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-7">
                    {/* Left Column */}
                    <FormField label="Employee" value={contract.employeeName} />
                    {/* Right Column Interleaved via Grid or we can stack them using subgrids. 
                        Let's interleave them to match horizontal alignment.
                     */}
                    <FormField label="Department" value={contract.department} />
                    <FormField label="Start Date" value={contract.start} />
                    <FormField label="Job Position" value={contract.jobPosition} />
                    <FormField label="End Date" value={contract.end} />
                    <FormField label="Wage / Month" value={contract.wage} />
                    <FormField label="Status" value={contract.status} />
                    <FormField label="Working Schedule" value={contract.schedule} />
                </div>
            </div>

            {/* Note Container */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-white/50 shadow-sm relative overflow-hidden">
                <h3 className="text-slate-500 font-medium mb-3 text-[15px]">Salary Structure / Notes</h3>
                <div className="text-slate-700 text-[15px] whitespace-pre-wrap leading-relaxed">
                    {contract.notes}
                </div>
            </div>
        </div>
    );
}

function FormField({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-slate-600 text-sm w-36 whitespace-nowrap">{label}</span>
            <Input
                readOnly
                value={value}
                className="bg-white border text-sm flex-1 rounded-xl h-10 shadow-sm outline-none cursor-default focus-visible:ring-0 focus-visible:border-slate-300 pointer-events-none text-slate-800 border-slate-200"
            />
        </div>
    )
}
