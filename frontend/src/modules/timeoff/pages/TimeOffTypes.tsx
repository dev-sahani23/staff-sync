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

export function TimeOffTypes() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [types, setTypes] = useState<any[]>([]);

    useEffect(() => {
        TimeOffAPI.types.getAll().then(setTypes).catch(console.error);
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Type",
            cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.name}</span>
        },
        {
            accessorKey: "unit",
            header: "Unit",
            cell: () => "Days" // Fixed to exactly match wireframe, we can add it if DB has it
        },
        {
            accessorKey: "requiresAllocation",
            header: "Allocation",
            cell: ({ row }) => row.original.requiresAllocation ? 'Required' : 'No'
        },
        {
            accessorKey: "approval",
            header: "Approval",
            cell: () => "Manager"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: () => <span className="text-emerald-600 font-medium">Active</span>
        }
    ];

    // Filter by search term natively
    const filteredTypes = types.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredTypes.length / ITEMS_PER_PAGE));
    const paginatedTypes = filteredTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Time Off Types"
                subtitle="List view opened from Time Off -> Time Off Types"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/timeoff/types/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search time off types..."
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
                    data={paginatedTypes}
                    onRowClick={(type) => navigate(`/timeoff/types/${type.id}`)}
                />
                <p className="mt-4 text-sm text-slate-400 italic">Useful note: this list defines policy rules, not employee transactions.</p>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
