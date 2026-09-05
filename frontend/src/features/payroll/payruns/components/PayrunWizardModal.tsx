import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryStructuresApi } from '@/services/salary-structures';
import { payrunsApi, type PayrunDraftPreview } from '@/services/payruns';
import { FormWizardModal } from '@/components/ui/FormWizardModal';
import { Search, CheckSquare, Square } from 'lucide-react';

interface PayrunWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayrunWizardModal: React.FC<PayrunWizardModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [payrunName, setPayrunName] = useState('September 2026 Monthly Payroll');
  const [salaryStructureId, setSalaryStructureId] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');

  // Step 2 selections
  const [previewData, setPreviewData] = useState<PayrunDraftPreview | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const { data: structures = [] } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: salaryStructuresApi.list,
    enabled: isOpen,
  });

  React.useEffect(() => {
    if (structures.length > 0 && !salaryStructureId) {
      setSalaryStructureId(structures[0].id);
    }
  }, [structures, salaryStructureId]);

  // Reset modal state when closed or opened
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setPreviewData(null);
      setSelectedEmployeeIds([]);
      setEmployeeSearch('');
    }
  }, [isOpen]);

  // Preview mutation (Step 1 -> Step 2)
  const previewMutation = useMutation({
    mutationFn: () =>
      payrunsApi.previewDraft({
        salaryStructureId,
        periodStart,
        periodEnd,
      }),
    onSuccess: (data) => {
      setPreviewData(data);
      // Default to all eligible employees selected with valid IDs
      const validIds = data.eligibleEmployees
        .map((e) => e.id || e.employeeId)
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null');
      setSelectedEmployeeIds(validIds);
      setCurrentStep(2);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to preview scope');
    },
  });

  // Final create mutation (Step 2 submit)
  const createMutation = useMutation({
    mutationFn: () => {
      const validEmployeeIds = selectedEmployeeIds.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null'
      );
      if (validEmployeeIds.length === 0) {
        throw new Error('Please select at least one employee');
      }
      return payrunsApi.create({
        name: payrunName,
        salaryStructureId,
        periodStart,
        periodEnd,
        employeeIds: validEmployeeIds,
      });
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      onClose();
      navigate(`/payroll/payruns/${created.id}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create payrun');
    },
  });

  const handleToggleEmployee = (id: string) => {
    if (!id) return;
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (!previewData) return;
    const allIds = previewData.eligibleEmployees
      .map((e) => e.id || e.employeeId)
      .filter(Boolean);
    setSelectedEmployeeIds((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  };

  const filteredEligible = (previewData?.eligibleEmployees || []).filter((e) =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <FormWizardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Payrun Batch"
      subtitle="Configure wage scope, payroll period, and employee inclusion"
      currentStep={currentStep}
      totalSteps={2}
      stepTitles={['Scope & Period', 'Employee Selection']}
      onNext={() => previewMutation.mutate()}
      onBack={() => setCurrentStep(1)}
      onSubmit={() => createMutation.mutate()}
      nextDisabled={!salaryStructureId || !periodStart || !periodEnd || previewMutation.isPending}
      submitDisabled={selectedEmployeeIds.length === 0 || createMutation.isPending}
      isSubmitting={createMutation.isPending || previewMutation.isPending}
      submitLabel="Create Payrun"
    >
      {currentStep === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Payrun Batch Name *
            </label>
            <input
              type="text"
              required
              value={payrunName}
              onChange={(e) => setPayrunName(e.target.value)}
              placeholder="e.g. September 2026 Monthly Payroll"
              className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Salary Structure *
            </label>
            <select
              value={salaryStructureId}
              onChange={(e) => setSalaryStructureId(e.target.value)}
              className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] font-medium focus:bg-white focus:border-2 focus:border-[#3B82F6]"
            >
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rules?.length || 0} calculation rules)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Period Start *
              </label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Period End *
              </label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 text-xs font-medium text-blue-900 border-0 shadow-none">
            <span className="font-bold text-blue-950">Note:</span> Clicking "Continue" will preview eligible active contracts without creating any database records until Step 2 is confirmed.
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs font-bold text-[#111827]">
                Eligible Employees ({selectedEmployeeIds.length} of {previewData?.totalEligible || previewData?.eligibleEmployees.length || 0} selected)
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Employees with an active contract matching this structure during {periodStart} – {periodEnd}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs font-bold text-[#3B82F6] hover:underline"
            >
              {selectedEmployeeIds.length === (previewData?.eligibleEmployees.length || 0)
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 stroke-[2.2]" />
            <input
              type="text"
              placeholder="Search eligible employees..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-xs bg-[#F3F4F6] border-0 rounded-md outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
            />
          </div>

          {/* Employee Selection List */}
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
            {filteredEligible.map((emp) => {
              const empId = emp.id || emp.employeeId;
              const isSelected = selectedEmployeeIds.includes(empId);
              return (
                <div
                  key={empId}
                  onClick={() => handleToggleEmployee(empId)}
                  className={`px-4 py-3 flex items-center justify-between text-xs cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[#3B82F6] flex items-center justify-center">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 stroke-[2]" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-[#111827]">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-gray-400 ml-2 font-medium">({emp.jobPosition || 'Employee'})</span>
                      <div className="text-[11px] text-gray-500 font-medium">{emp.department || 'General'}</div>
                    </div>
                  </div>

                  <div className="font-extrabold text-[#111827] tabular-nums">
                    ₹{Number(emp.contractWage || emp.wage || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}

            {filteredEligible.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400 font-medium">
                No eligible employees found for this structure and period.
              </div>
            )}
          </div>
        </div>
      )}
    </FormWizardModal>
  );
};
