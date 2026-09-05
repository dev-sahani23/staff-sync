import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollAPI, EmployeeAPI } from '@/api/api';
import { PaginationControls } from '@/components/ui/pagination-controls';

export function Payruns() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [payruns, setPayruns] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEmployeeSelectModalOpen, setIsEmployeeSelectModalOpen] = useState(false);
    const [structures, setStructures] = useState<any[]>([]);

    // Modal state
    const [newPayrunName, setNewPayrunName] = useState('');
    const [newStructureId, setNewStructureId] = useState('');
    const [newPeriodStart, setNewPeriodStart] = useState('');
    const [newPeriodEnd, setNewPeriodEnd] = useState('');

    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    const fetchPayruns = () => {
        PayrollAPI.payruns.getAll().then(setPayruns).catch(console.error);
    };

    useEffect(() => {
        fetchPayruns();
        PayrollAPI.structures.getAll().then(setStructures).catch(console.error);
        EmployeeAPI.getAll().then(setEmployees).catch(console.error);
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Payrun",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-slate-800 text-base">{row.original.name}</div>
                    <div className="text-sm text-slate-500">
                        {new Date(row.original.periodStart).toLocaleDateString()} - {new Date(row.original.periodEnd).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "employees",
            header: "Employees",
            cell: ({ row }) => `${row.original.payslips?.length || 0} employees`
        },
        {
            accessorKey: "status",
            header: "State",
            cell: ({ row }) => {
                const status = row.original.status || 'Draft';
                let colorClass = 'text-slate-600';
                if (status === 'PAID') colorClass = 'text-emerald-600 font-medium';
                if (status === 'VALIDATED') colorClass = 'text-blue-600 font-medium';
                if (status === 'DRAFT') colorClass = 'text-slate-600';

                // Demo warning
                const warnings = row.original.payslips?.filter((p: any) => p.warnings)?.length || 0;

                return (
                    <div>
                        <div className={colorClass}>{status}</div>
                        {warnings > 0 && <div className="text-amber-500 text-xs mt-1">{warnings} warning(s)</div>}
                    </div>
                );
            }
        }
    ];

    const filteredPayruns = payruns.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(filteredPayruns.length / ITEMS_PER_PAGE));
    const paginated = filteredPayruns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleContinueToEmployeeSelect = () => {
        if (!newStructureId || !newPeriodStart || !newPeriodEnd) {
            alert("Please fill all fields");
            return;
        }
        setNewPayrunName(`Payrun ${newPeriodStart}`);
        setIsCreateModalOpen(false);
        setIsEmployeeSelectModalOpen(true);
    };

    const handleCreatePayrun = async () => {
        try {
            await PayrollAPI.payruns.create({
                name: newPayrunName,
                salaryStructureId: newStructureId,
                periodStart: newPeriodStart,
                periodEnd: newPeriodEnd,
                employeeIds: selectedEmployeeIds
            });
            setIsEmployeeSelectModalOpen(false);
            fetchPayruns();
        } catch (e) {
            console.error(e);
            alert("Failed to create payrun. Make sure you select active employees with contracts.");
        }
    };

    const toggleEmployeeSelect = (id: string) => {
        if (selectedEmployeeIds.includes(id)) {
            setSelectedEmployeeIds(selectedEmployeeIds.filter(x => x !== id));
        } else {
            setSelectedEmployeeIds([...selectedEmployeeIds, id]);
        }
    };

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Payruns"
                subtitle="Payrun view for payroll periods"
                actions={
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#2563eb] text-white hover:bg-blue-700 h-10 px-6 rounded-xl font-medium shadow-none">
                                NEW
                            </Button>
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search payruns..."
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
                    onRowClick={(payrun) => navigate(`/payroll/payruns/${payrun.id}`)}
                />
                <p className="mt-4 text-sm text-slate-400 italic">Useful note: each Payrun represents one payroll period and groups the payslips generated for that period.</p>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal for New Pay Run */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-800">New Pay Run</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Pay Structure</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                                        value={newStructureId}
                                        onChange={(e) => setNewStructureId(e.target.value)}
                                    >
                                        <option value="">Select Structure...</option>
                                        {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Period</label>
                                    <div className="flex items-center gap-4">
                                        <Input type="date" value={newPeriodStart} onChange={e => setNewPeriodStart(e.target.value)} className="h-11 rounded-xl" />
                                        <span className="text-slate-400">to</span>
                                        <Input type="date" value={newPeriodEnd} onChange={e => setNewPeriodEnd(e.target.value)} className="h-11 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex items-center gap-3">
                            <Button onClick={handleContinueToEmployeeSelect} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-8 rounded-xl font-medium shadow-none">
                                Continue
                            </Button>
                            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 font-medium">
                                Discard
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Select Employee Records */}
            {isEmployeeSelectModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-800">Select Employee Records</h2>
                            <button onClick={() => setIsEmployeeSelectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-slate-500 font-medium">
                                        <th className="p-3 w-10">✓</th>
                                        <th className="p-3">Employee</th>
                                        <th className="p-3">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedEmployeeIds.includes(emp.id)}
                                                    onChange={() => toggleEmployeeSelect(emp.id)}
                                                />
                                            </td>
                                            <td className="p-3">{emp.name || emp.email}</td>
                                            <td className="p-3">{emp.department || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex items-center gap-3">
                            <Button onClick={handleCreatePayrun} disabled={selectedEmployeeIds.length === 0} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-8 rounded-xl font-medium shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
                                Create payrun
                            </Button>
                            <Button variant="ghost" onClick={() => setIsEmployeeSelectModalOpen(false)} className="h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 font-medium">
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
