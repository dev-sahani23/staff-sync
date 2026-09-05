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

export function Requests() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = () => {
        TimeOffAPI.requests.getAll().then(setRequests).catch(console.error);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await TimeOffAPI.requests.approve(id);
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleRefuse = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await TimeOffAPI.requests.refuse(id);
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to refuse');
        }
    };

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
            accessorKey: "startDate",
            header: "Start",
            cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        },
        {
            accessorKey: "endDate",
            header: "End",
            cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        },
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }) => `${row.original.duration} Days`
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let colorClass = 'text-slate-600';
                if (status === 'APPROVED') colorClass = 'text-emerald-600 font-medium';
                if (status === 'REFUSED') colorClass = 'text-red-500 font-medium';
                if (status === 'PENDING') colorClass = 'text-amber-600 font-medium';
                return <span className={colorClass}>{status}</span>;
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                if (row.original.status !== 'PENDING') return null;
                return (
                    <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={(e) => handleApprove(e, row.original.id)} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs h-8">Approve</Button>
                        <Button size="sm" variant="outline" onClick={(e) => handleRefuse(e, row.original.id)} className="h-8 text-xs text-slate-600">Refuse</Button>
                    </div>
                );
            }
        }
    ];

    // Filter by search term natively
    const filteredRequests = requests.filter(req => {
        const empName = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : '';
        return empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.timeOffType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Time Off Requests"
                subtitle="List view opened from Time Off -> Requests"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/timeoff/requests/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                                />
                            </div>
                            <Button variant="outline" className="h-10 px-4 rounded-xl text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50 font-medium">
                                My Team
                            </Button>
                        </div>
                    </div>
                }
            />

            <div className="pb-6">
                <DataTable
                    columns={columns}
                    data={paginatedRequests}
                    onRowClick={(req) => navigate(`/timeoff/requests/${req.id}`)}
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
