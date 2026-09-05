import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ScheduleAPI } from '@/api/api';
import { PaginationControls } from '@/components/ui/pagination-controls';

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Schedule Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "weeklyHours",
        header: "Weekly Hours",
        cell: ({ row }) => (
            <span className="font-medium text-slate-800">{row.getValue("weeklyHours")} hrs</span>
        )
    }
];

export function Schedules() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [schedules, setSchedules] = useState<any[]>([]);

    useEffect(() => {
        ScheduleAPI.getAll().then(setSchedules).catch(console.error);
    }, []);

    // Filter by search term natively
    const filteredSchedules = schedules.filter(sch => sch.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Paginate results
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE));
    const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Working Schedules"
                subtitle="Manage and configure work schedules for employees"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/schedules/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search schedules..."
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
                    data={paginatedSchedules}
                    onRowClick={(sch) => navigate(`/schedules/${sch.id}`)}
                />
            </div>

            {/* Pagination Controls */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
