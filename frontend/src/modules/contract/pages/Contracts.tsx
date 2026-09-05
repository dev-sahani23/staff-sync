import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ContractAPI } from '@/api/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationControls } from '@/components/ui/pagination-controls';

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "contractCode",
        header: "Contract",
    },
    {
        accessorKey: "employeeName",
        header: "Employee",
    },
    {
        accessorKey: "start",
        header: "Start",
    },
    {
        accessorKey: "end",
        header: "End",
    },
    {
        accessorKey: "wage",
        header: "Wage / Month",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <span className={`text-[13px] font-medium ${status === 'Running' ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {status}
                </span>
            );
        }
    }
];

export function Contracts() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        ContractAPI.getAll().then(setContracts).catch(console.error);
    }, []);

    const filteredContracts = contracts.filter(c => c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredContracts.length / ITEMS_PER_PAGE));
    const paginatedContracts = filteredContracts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full font-sans max-w-[1000px]">
            <PageHeader
                title="Contracts"
                subtitle="List view of employee contracts"
                actions={
                    <div className="flex items-center gap-4 w-full mt-2 sm:mt-0 sm:w-auto">
                        <Button className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                            NEW
                        </Button>
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search contracts..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                            />
                        </div>
                    </div>
                }
            />

            <div className="pb-6 mt-6">
                <DataTable
                    columns={columns}
                    data={paginatedContracts}
                    onRowClick={(row) => navigate(`/contract/${row.id}`)}
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
