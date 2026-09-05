import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { TimeOffAPI } from '@/api/api';
import { PaginationControls } from '@/components/ui/pagination-controls';

export function Allocations() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [allocations, setAllocations] = useState<any[]>([]);

    useEffect(() => {
        TimeOffAPI.allocations.getAll().then(setAllocations).catch(console.error);
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => row.original.employee ? `${row.original.employee.firstName} ${row.original.employee.lastName}` : 'Unknown'
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => row.original.timeOffType?.name || 'Unknown'
        },
        {
            accessorKey: "allocated",
            header: "Allocated",
            cell: ({ row }) => `${row.original.allocated} Days`
        },
        {
            accessorKey: "taken",
            header: "Taken",
            cell: ({ row }) => `${row.original.taken} Days`
        },
        {
            accessorKey: "remaining",
            header: "Remaining",
            cell: ({ row }) => `${row.original.remaining} Days`
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                // Assuming status is returned by API, if not mock it as Approved
                const status = row.original.status || 'Approved';
                let colorClass = 'text-slate-600';
                if (status === 'Approved' || status === 'APPROVED') colorClass = 'text-emerald-600 font-medium';
                if (status === 'To Approve' || status === 'PENDING') colorClass = 'text-amber-600 font-medium';
                return <span className={colorClass}>{status}</span>;
            }
        }
    ];

    // Filter by search term natively
    const filteredAllocs = allocations.filter(a => {
        const empName = a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : '';
        return empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.timeOffType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredAllocs.length / ITEMS_PER_PAGE));
    const paginatedAllocs = filteredAllocs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Allocations"
                subtitle="List view opened from Time Off -> Allocations"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/timeoff/allocations/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search allocations..."
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
                    data={paginatedAllocs}
                    onRowClick={(req) => navigate(`/timeoff/allocations/${req.id}`)}
                />
                <p className="mt-4 text-sm text-slate-400 italic">Useful note: the list should expose the balance math at a glance — Allocated, Taken and Remaining.</p>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
