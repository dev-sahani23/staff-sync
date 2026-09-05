import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollAPI } from '@/api/api';

export function PayslipDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [slip, setSlip] = useState<any>(null);

    useEffect(() => {
        if (id) {
            PayrollAPI.payslips.getById(id).then(setSlip).catch(console.error);
        }
    }, [id]);

    const linesColumns: ColumnDef<any>[] = [
        {
            accessorKey: "salaryRule.name",
            header: "Salary Rule",
            cell: ({ row }) => row.original.salaryRule?.name || row.original.label
        },
        {
            accessorKey: "salaryRule.code",
            header: "Code",
            cell: ({ row }) => row.original.salaryRule?.code || '-'
        },
        {
            accessorKey: "salaryRule.category",
            header: "Category",
            cell: ({ row }) => row.original.salaryRule?.category || '-'
        },
        {
            accessorKey: "salaryRule.sequence",
            header: "Sequence",
            cell: ({ row }) => row.original.salaryRule?.sequence || '-'
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const isDeducation = row.original.salaryRule?.category === 'DEDUCTION';
                const sign = isDeducation ? '-' : '';
                const color = isDeducation ? 'text-red-600' : 'text-slate-800';
                return <span className={`font-mono font-medium ${color}`}>{sign}₹{row.original.amount.toLocaleString()}</span>;
            }
        }
    ];

    if (!slip) return <div>Loading...</div>;

    const empName = slip.employee ? `${slip.employee.firstName || ''} ${slip.employee.lastName || ''}`.trim() : 'Unknown';

    return (
        <div className="w-full font-sans pb-10">
            <PageHeader
                title={`Payslip / ${empName} / ${slip.payrun?.name}`}
                subtitle="Detailed computation of an individual employee's salary"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate('/payroll/payslips')} className="h-10 rounded-xl bg-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button className="bg-purple-600 text-white hover:bg-purple-700 h-10 px-6 rounded-xl font-medium shadow-none">
                            <Printer className="h-4 w-4 mr-2" />
                            Print PDF
                        </Button>
                    </div>
                }
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Employee</label>
                        <Input readOnly value={empName} className="h-11 rounded-xl bg-slate-50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Payrun</label>
                        <Input readOnly value={slip.payrun?.name || ''} className="h-11 rounded-xl bg-slate-50 border-blue-200 text-blue-700 cursor-pointer" onClick={() => navigate(`/payroll/payruns/${slip.payrunId}`)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Worked Days</label>
                        <Input readOnly value={slip.workedDays} className="h-11 rounded-xl bg-slate-50" />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-medium text-blue-600 mb-4">Computation Lines</h2>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <DataTable
                            columns={linesColumns}
                            data={slip.lines || []}
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-200 min-w-[300px]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500">Total Deductions</span>
                                <span className="text-red-500 font-mono">
                                    -₹{(slip.lines?.filter((l: any) => l.salaryRule?.category === 'DEDUCTION').reduce((a: number, b: any) => a + b.amount, 0) || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 border-dashed">
                                <span className="font-semibold text-slate-800">Net Pay</span>
                                <span className="text-emerald-600 font-bold font-mono text-lg space-x-0.5">
                                    ₹{(slip.lines?.filter((l: any) => ['BASIC', 'ALLOWANCE', 'GROSS'].includes(l.salaryRule?.category)).reduce((a: number, b: any) => a + b.amount, 0) || 0 - (slip.lines?.filter((l: any) => l.salaryRule?.category === 'DEDUCTION').reduce((a: number, b: any) => a + b.amount, 0) || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
