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

export function Structures() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [structures, setStructures] = useState<any[]>([]);

    useEffect(() => {
        PayrollAPI.structures.getAll().then(setStructures).catch(console.error);
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Structure Name",
            cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.name}</span>
        },
        {
            accessorKey: "rules",
            header: "Rules",
            cell: ({ row }) => `${row.original.rules?.length || 0} rules`
        },
        {
            accessorKey: "employees",
            header: "Employees",
            cell: () => `42 employees` // Mocked count, we'll need a DB agg for real
        },
        {
            accessorKey: "status",
            header: "Active",
            cell: ({ row }) => {
                const isActive = row.original.status === 'ACTIVE';
                return <span className={isActive ? "text-emerald-600 font-medium" : "text-slate-500"}>{isActive ? 'Active' : 'Inactive'}</span>;
            }
        }
    ];

    const filteredStructures = structures.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredStructures.length / ITEMS_PER_PAGE));
    const paginated = filteredStructures.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Salary Structures"
                subtitle="List view opened from Payroll -> Structures"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/payroll/structures/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search structures..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                                />
                            </div>
                        </div>
                    </div>
                }
            />

            <div className="pb-6">
                <DataTable
                    columns={columns}
                    data={paginated}
                    onRowClick={(struct) => navigate(`/payroll/structures/${struct.id}`)}
                />
                <p className="mt-4 text-sm text-slate-400 italic">Useful note: the Salary Structure selected on a Payrun determines which set of salary rules will calculate each payslip.</p>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
