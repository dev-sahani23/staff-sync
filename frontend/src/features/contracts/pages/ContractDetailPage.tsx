import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '@/services/contracts';
import { employeesApi } from '@/services/employees';
import { salaryStructuresApi } from '@/services/salary-structures';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Can } from '@/lib/permissions';
import { Save, CheckCircle, AlertTriangle, User, Layers } from 'lucide-react';
import type { Contract, ContractStatus } from '@/types';

export const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [employeeId, setEmployeeId] = useState('');
  const [salaryStructureId, setSalaryStructureId] = useState('');
  const [wage, setWage] = useState<number>(50000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ContractStatus>('DRAFT');
  const [department, setDepartment] = useState('Engineering');
  const [jobPosition, setJobPosition] = useState('');

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.get(id!),
    enabled: !isNew && !!id,
  });

  const { data: allContracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.list,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const { data: structures = [] } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: salaryStructuresApi.list,
  });

  useEffect(() => {
    if (contract) {
      setEmployeeId(contract.employeeId);
      setSalaryStructureId(contract.salaryStructureId);
      setWage(contract.wage);
      setStartDate(contract.startDate.substring(0, 10));
      setEndDate(contract.endDate ? contract.endDate.substring(0, 10) : '');
      setStatus(contract.status);
      setDepartment(contract.department || '');
      setJobPosition(contract.jobPosition || '');
    } else if (structures.length > 0 && !salaryStructureId) {
      setSalaryStructureId(structures[0].id);
    }
  }, [contract, structures]);

  // Check for concurrent active contract warning
  const hasConcurrentActiveContract = React.useMemo(() => {
    if (status !== 'ACTIVE' || !employeeId) return false;
    return allContracts.some(
      (c) => c.id !== id && c.employeeId === employeeId && c.status === 'ACTIVE'
    );
  }, [allContracts, employeeId, status, id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Partial<Contract> = {
        employeeId,
        salaryStructureId,
        wage: Number(wage),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        status,
        department,
        jobPosition,
      };

      if (isNew) {
        return contractsApi.create(payload);
      } else {
        return contractsApi.update(id!, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      alert('Contract details saved successfully.');
      navigate('/contracts');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to save contract');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => contractsApi.activate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      setStatus('ACTIVE');
      alert('Contract status is now ACTIVE.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to activate contract');
    },
  });

  const currentEmployee = employees.find((e) => e.id === employeeId);
  const currentStructure = structures.find((s) => s.id === salaryStructureId);

  if (!isNew && isLoading) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Contracts', href: '/contracts' },
          { label: isNew ? 'New Contract' : `CON-${id?.substring(0, 6).toUpperCase()}` },
        ]}
      />

      <div className="bg-white border border-[#DDE3EC] rounded-2xl p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE3EC]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#17233D]">
                {isNew ? 'New Employment Contract' : `Contract CON-${id?.substring(0, 6).toUpperCase()}`}
              </h1>
              <StatusBadge status={status} />
            </div>
            {currentEmployee && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <span>Employee:</span>
                <Link
                  to={`/employees/${currentEmployee.id}`}
                  className="font-semibold text-[#2F5D82] hover:underline flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!isNew && status !== 'ACTIVE' && (
              <Can permission="contracts:write">
                <button
                  type="button"
                  onClick={() => activateMutation.mutate()}
                  disabled={activateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-[#1E7A4C] border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate Contract
                </button>
              </Can>
            )}

            <Can permission="contracts:write">
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] hover:bg-[#254B68] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Contract'}
              </button>
            </Can>
          </div>
        </div>

        {/* Overlapping Running Contract Warning */}
        {hasConcurrentActiveContract && (
          <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-[#B4780A] flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Multiple Active Contracts Detected</div>
              <p className="mt-0.5 text-amber-800">
                This employee already has another Running/Active contract. Non-negotiable payroll rules require only one active contract per period to compute payruns. Please review before proceeding.
              </p>
            </div>
          </div>
        )}

        <form className="space-y-4 my-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  const emp = employees.find((x) => x.id === e.target.value);
                  if (emp) {
                    if (emp.department) setDepartment(emp.department);
                    if (emp.jobPosition) setJobPosition(emp.jobPosition);
                  }
                }}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Salary Structure *
              </label>
              <select
                value={salaryStructureId}
                onChange={(e) => setSalaryStructureId(e.target.value)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {currentStructure && (
                <div className="mt-1 text-[11px] text-slate-500">
                  <Link
                    to={`/payroll/structures/${currentStructure.id}`}
                    className="text-[#2F5D82] hover:underline inline-flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" /> View Structure Rules
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Monthly Wage (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={wage}
                onChange={(e) => setWage(Number(e.target.value))}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Job Position
              </label>
              <input
                type="text"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233D] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE (Running)</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
