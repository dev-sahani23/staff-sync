import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollAPI } from '@/api/api';
import { PaginationControls } from '@/components/ui/pagination-controls';

export function Payslips() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [payslips, setPayslips] = useState<any[]>([]);

    useEffect(() => {
        PayrollAPI.payslips.getAll().then(setPayslips).catch(console.error);
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => (
                <div className="font-medium text-slate-800">
                    {row.original.employee ? `${row.original.employee.firstName || ''} ${row.original.employee.lastName || ''}`.trim() : 'Unknown'}
                </div>
            )
        },
        {
            accessorKey: "payrun",
            header: "Payrun",
            cell: ({ row }) => row.original.payrun?.name || '-'
        },
        {
            accessorKey: "basic",
            header: "Basic Salary",
            cell: ({ row }) => {
                const basicLine = row.original.lines?.find((l: any) => l.salaryRule?.code === 'BASIC');
                return basicLine ? `₹${basicLine.amount.toLocaleString()}` : '-';
            }
        },
        {
            accessorKey: "gross",
            header: "Gross Salary",
            cell: ({ row }) => {
                const addLine = row.original.lines?.filter((l: any) => l.salaryRule?.category === 'ALLOWANCE' || l.salaryRule?.code === 'BASIC').reduce((sum: number, l: any) => sum + l.amount, 0);
                return addLine ? `₹${addLine.toLocaleString()}` : '-';
            }
        },
        {
            accessorKey: "warnings",
            header: "Warnings",
            cell: ({ row }) => row.original.warnings ? <span className="text-amber-500 font-medium">{row.original.warnings}</span> : <span className="text-slate-400">None</span>
        }
    ];

    const filteredPayslips = payslips.filter(s => {
        const empName = `${s.employee?.firstName} ${s.employee?.lastName}`.toLowerCase();
        return empName.includes(searchTerm.toLowerCase());
    });

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredPayslips.length / ITEMS_PER_PAGE));
    const paginated = filteredPayslips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Employee Payslips"
                subtitle="List of all computed payslips across all payruns"
                actions={
                    <div className="flex justify-end items-center w-full">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search by employee name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                            />
                        </div>
                    </div>
                }
            />

            <div className="pb-6">
                <DataTable
                    columns={columns}
                    data={paginated}
                    onRowClick={(slip) => navigate(`/payroll/payslips/${slip.id}`)}
                />
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
