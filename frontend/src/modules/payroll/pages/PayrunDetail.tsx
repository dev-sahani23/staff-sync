import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CopyCheck, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollAPI } from '@/api/api';

export function PayrunDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [payrun, setPayrun] = useState<any>(null);
    const [payslips, setPayslips] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchPayrun();
        }
    }, [id]);

    const fetchPayrun = () => {
        PayrollAPI.payruns.getById(id as string).then(data => {
            if (data) {
                setPayrun(data);
                setPayslips(data.payslips || []);
            }
        }).catch(console.error);
    };

    const updateStatus = async (status: string) => {
        try {
            await PayrollAPI.payruns.updateStatus(id as string, status);
            fetchPayrun(); // refresh
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    const payslipsColumns: ColumnDef<any>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => row.original.employee ? `${row.original.employee.firstName || ''} ${row.original.employee.lastName || ''}`.trim() : 'Unknown'
        },
        {
            accessorKey: "warning",
            header: "Warning",
            cell: ({ row }) => {
                if (!row.original.warnings) return <span className="text-slate-400">—</span>;
                return <span className="text-amber-500 font-medium text-xs">{row.original.warnings}</span>;
            }
        },
        {
            accessorKey: "worked",
            header: "Worked",
            cell: ({ row }) => row.original.workedDays
        },
        {
            accessorKey: "basic",
            header: "Basic",
            cell: ({ row }) => {
                const basicLine = row.original.lines?.find((l: any) => l.salaryRule?.code === 'BASIC');
                return basicLine ? `₹${basicLine.amount.toLocaleString()}` : '-';
            }
        },
        {
            accessorKey: "gross",
            header: "Gross",
            cell: ({ row }) => {
                const addLine = row.original.lines?.filter((l: any) => l.salaryRule?.category === 'ALLOWANCE' || l.salaryRule?.code === 'BASIC').reduce((sum: number, l: any) => sum + l.amount, 0);
                return addLine ? `₹${addLine.toLocaleString()}` : '-';
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: () => {
                const s = payrun?.status || 'DRAFT';
                if (s === 'PAID') return <span className="text-emerald-600 font-medium">Done</span>;
                if (s === 'VALIDATED') return <span className="text-blue-600 font-medium">Validated</span>;
                return <span className="text-slate-500">Draft</span>;
            }
        },
        {
            id: "actions",
            header: "PDF",
            cell: () => <button className="text-blue-600 font-medium text-xs underline">PDF</button>
        }
    ];

    if (!payrun) return <div>Loading...</div>;

    const isDraft = payrun.status === 'DRAFT';
    const isValidated = payrun.status === 'VALIDATED';

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={`Payrun / ${payrun.name}`}
                subtitle="Open one Payrun to compute and manage its payslips"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/payroll/payruns')} className="h-10 rounded-xl bg-white text-slate-600">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                }
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-5xl">

                {/* Actions Toolbar per wireframe */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                    <div className="flex gap-3">
                        <Button disabled={!isDraft} onClick={() => updateStatus('COMPUTED')} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none text-xs tracking-wider uppercase">
                            Compute
                        </Button>
                        <Button disabled={!isDraft} onClick={() => updateStatus('VALIDATED')} variant="outline" className="h-10 px-6 rounded-xl shadow-none text-xs tracking-wider uppercase">
                            <Check className="h-4 w-4 mr-2" /> Validate
                        </Button>
                        <Button disabled={!isValidated} onClick={() => updateStatus('PAID')} variant="outline" className="h-10 px-6 rounded-xl shadow-none text-xs tracking-wider uppercase">
                            <CopyCheck className="h-4 w-4 mr-2" /> Mark Paid
                        </Button>
                    </div>
                    <div>
                        <Button className="bg-purple-600 text-white hover:bg-purple-700 h-10 px-6 rounded-xl font-medium shadow-none text-xs tracking-wider uppercase">
                            Send Payslips
                        </Button>
                    </div>
                </div>

                {/* Form Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Name</label>
                        <Input readOnly value={payrun.name} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Salary Structure</label>
                        <Input readOnly value={payrun.salaryStructure?.name || 'Unknown'} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Period</label>
                        <Input readOnly value={`${new Date(payrun.periodStart).toLocaleDateString()} - ${new Date(payrun.periodEnd).toLocaleDateString()}`} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Status</label>
                        <Input readOnly value={payrun.status} className="h-11 rounded-xl bg-slate-50" />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-medium text-blue-600 mb-4">Payslips in this Payrun</h2>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <DataTable
                            columns={payslipsColumns}
                            data={payslips}
                            onRowClick={(slip) => navigate(`/payroll/payslips/${slip.id}`)}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-400 italic">Useful note: warnings such as missing account data or duplicate payslips should be visible before payroll is finalized.</p>
                </div>
            </div>
        </div>
    );
}
