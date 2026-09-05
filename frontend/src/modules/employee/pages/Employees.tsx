import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { mockEmployees, type Employee } from '@/data/mockEmployees';

const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "name",
        header: "Employee",
    },
    {
        accessorKey: "email",
        header: "Work Email",
    },
    {
        accessorKey: "role",
        header: "Job Position",
    },
    {
        accessorKey: "department",
        header: "Department",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span className="text-emerald-600 text-sm font-medium">{row.getValue("status")}</span>
        )
    }
];

export function Employees() {
    const navigate = useNavigate();
    const [view, setView] = useState<'kanban' | 'list'>('kanban');

    // Retrieve from our globally simulated store! 
    const employees = mockEmployees;

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Employees"
                subtitle={view === 'kanban' ? "Default view: Kanban" : "List view for sort, filter and bulk scanning"}
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => navigate('/employee/new')} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-10 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-[15px]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white">
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-6 py-1.5 rounded-lg text-sm transition-colors ${view === 'kanban' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Kanban
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-6 py-1.5 rounded-lg text-sm transition-colors ${view === 'list' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                }
            />

            {view === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {employees.map(emp => (
                        <div
                            key={emp.id}
                            onClick={() => navigate(`/employee/${emp.id}`)}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                        >
                            <div className="flex items-start gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                                    {emp.initials}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800">{emp.name}</h3>
                                    <p className="text-slate-500">{emp.role}</p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <p className="text-slate-600 mb-1.5">{emp.department}</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-emerald-600 text-sm font-medium">{emp.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'list' && (
                <div className="pb-12">
                    <DataTable
                        columns={columns}
                        data={employees}
                        searchKey="name"
                        onRowClick={(emp) => navigate(`/employee/${emp.id}`)}
                    />
                </div>
            )}

        </div>
    );
}
