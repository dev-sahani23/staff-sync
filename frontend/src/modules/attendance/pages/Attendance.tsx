import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { AttendanceAPI } from '@/api/api';
import { useEffect, useState } from 'react';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useNavigate } from 'react-router-dom';

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "employeeName",
        header: "Employee",
    },
    {
        accessorKey: "checkIn",
        header: "Check In",
    },
    {
        accessorKey: "checkOut",
        header: "Check Out",
    },
    {
        accessorKey: "workedHours",
        header: "Worked Hours",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <span className={`text-[13px] font-medium ${status === 'Present' ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {status}
                </span>
            );
        }
    }
];

export function Attendance() {
    const navigate = useNavigate();
    const [records, setRecords] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        AttendanceAPI.getAll().then(setRecords).catch(console.error);
    }, []);

    const filteredRecords = records.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
    const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans max-w-[1000px]">
            <PageHeader
                title="Attendance"
                subtitle="List view of employee attendance records"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full mt-2 sm:mt-0">
                        <div className="flex flex-wrap items-center gap-4 w-full">
                            <Button className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-8 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[280px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search attendance..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                                />
                            </div>
                            <Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-10 px-6 text-sm">
                                Today
                            </Button>
                            <Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl h-10 px-6 text-sm">
                                Employee: Aarav
                            </Button>
                        </div>
                    </div>
                }
            />

            <div className="pb-6 mt-8">
                <DataTable
                    columns={columns}
                    data={paginatedRecords}
                    onRowClick={(row) => navigate(`/attendance/${row.id}`)}
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
