import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryStructuresApi } from '@/services/salary-structures';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Can } from '@/lib/permissions';
import { Plus, Trash2, Save, X, Users } from 'lucide-react';
import type { SalaryRule, RuleCategory, ComputeMethod } from '@/types';

export const SalaryStructureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [name, setName] = useState('Standard Corporate Structure');
  const [status, setStatus] = useState('ACTIVE');
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);

  // New rule modal state
  const [ruleCode, setRuleCode] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [ruleCategory, setRuleCategory] = useState<RuleCategory>('ALLOWANCE');
  const [ruleSequence, setRuleSequence] = useState<number>(1);
  const [computeMethod, setComputeMethod] = useState<ComputeMethod>('FIXED');
  const [amount, setAmount] = useState<number>(1000);
  const [baseCode, setBaseCode] = useState('BASIC');
  const [formula, setFormula] = useState('');

  const { data: structure, isLoading } = useQuery({
    queryKey: ['salary-structure', id],
    queryFn: () => salaryStructuresApi.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (structure) {
      setName(structure.name);
      setStatus(structure.status);
      if (structure.rules) {
        setRuleSequence(structure.rules.length + 1);
      }
    }
  }, [structure]);

  const saveStructureMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        return salaryStructuresApi.create({ name, status });
      } else {
        return salaryStructuresApi.update(id!, { name, status });
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      alert('Salary structure saved successfully.');
      if (isNew) navigate(`/payroll/structures/${saved.id}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to save structure');
    },
  });

  const addRuleMutation = useMutation({
    mutationFn: (rule: Partial<SalaryRule>) => salaryStructuresApi.addRule(id!, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      setIsAddRuleModalOpen(false);
      setRuleCode('');
      setRuleName('');
      setFormula('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to add rule');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => salaryStructuresApi.deleteRule(id!, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to delete rule');
    },
  });

  if (!isNew && isLoading) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  const sortedRules = [...(structure?.rules || [])].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="max-w-[960px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Salary Structures', href: '/payroll/structures' },
          { label: isNew ? 'New Structure' : name },
        ]}
      />

      <div className="bg-white border border-[#DDE3EC] rounded-2xl p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE3EC]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#17233D]">
                {isNew ? 'New Salary Structure' : name}
              </h1>
              <StatusBadge status={status} />
            </div>
            {!isNew && structure?.contracts && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned to {structure.contracts.length} active employee contracts</span>
              </p>
            )}
          </div>

          <Can permission="structures:write">
            <button
              type="button"
              onClick={() => saveStructureMutation.mutate()}
              disabled={saveStructureMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] hover:bg-[#254B68] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveStructureMutation.isPending ? 'Saving...' : 'Save Structure'}
            </button>
          </Can>
        </div>

        {/* Structure Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div>
            <label className="block text-xs font-semibold text-[#17233D] mb-1">
              Structure Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17233D] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* Rules Included Table */}
        {!isNew && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#17233D]">Included Salary Rules</h3>
                <p className="text-xs text-slate-500">
                  Rules execute sequentially from lowest sequence to net pay formulation
                </p>
              </div>

              <Can permission="structures:write">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF1F6] text-[#2F5D82] hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Rule
                </button>
              </Can>
            </div>

            <div className="border border-[#DDE3EC] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F6F9] border-b border-[#DDE3EC] text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Seq</th>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Rule Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Computation Method</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC]">
                  {sortedRules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-700 tabular-nums">
                        #{r.sequence}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#2F5D82]">
                        {r.code}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#17233D]">{r.name}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r.category === 'BASIC'
                              ? 'bg-blue-50 text-blue-700'
                              : r.category === 'ALLOWANCE'
                              ? 'bg-emerald-50 text-[#1E7A4C]'
                              : r.category === 'DEDUCTION'
                              ? 'bg-rose-50 text-[#B23B3B]'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {r.computeMethod === 'PERCENTAGE' && `${r.amount}% of ${r.baseCode || 'WAGE'}`}
                        {r.computeMethod === 'FIXED' && `Fixed ₹${r.amount?.toLocaleString('en-IN')}`}
                        {r.computeMethod === 'FORMULA' && (
                          <span className="font-mono text-[11px]">Formula: {r.formula}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Can permission="structures:write">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove rule ${r.code}?`)) {
                                deleteRuleMutation.mutate(r.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-[#B23B3B] transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Can>
                      </td>
                    </tr>
                  ))}
                  {sortedRules.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No rules added to this structure yet. Click "Add Rule" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#DDE3EC] shadow-2xl w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#17233D]">Add Salary Rule to Structure</h3>
              <button
                onClick={() => setIsAddRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addRuleMutation.mutate({
                  code: ruleCode.toUpperCase().trim(),
                  name: ruleName,
                  category: ruleCategory,
                  sequence: Number(ruleSequence),
                  computeMethod,
                  amount: computeMethod !== 'FORMULA' ? Number(amount) : null,
                  baseCode: computeMethod === 'PERCENTAGE' ? baseCode : null,
                  formula: computeMethod === 'FORMULA' ? formula : null,
                });
              }}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Rule Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    placeholder="e.g. HRA, PF, BONUS"
                    className="w-full text-xs font-mono uppercase border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Sequence # *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ruleSequence}
                    onChange={(e) => setRuleSequence(Number(e.target.value))}
                    className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233D] mb-1">
                  Rule Description / Name *
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. House Rent Allowance"
                  className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Category *
                  </label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value as RuleCategory)}
                    className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="ALLOWANCE">ALLOWANCE</option>
                    <option value="DEDUCTION">DEDUCTION</option>
                    <option value="GROSS">GROSS</option>
                    <option value="NET">NET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Computation Method *
                  </label>
                  <select
                    value={computeMethod}
                    onChange={(e) => setComputeMethod(e.target.value as ComputeMethod)}
                    className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                  >
                    <option value="FIXED">FIXED (Fixed Currency Amount)</option>
                    <option value="PERCENTAGE">PERCENTAGE (% of Base)</option>
                    <option value="FORMULA">FORMULA (Mathematical Expression)</option>
                  </select>
                </div>
              </div>

              {computeMethod === 'FIXED' && (
                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Fixed Amount (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] tabular-nums"
                  />
                </div>
              )}

              {computeMethod === 'PERCENTAGE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#17233D] mb-1">
                      Percentage (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17233D] mb-1">
                      Base Code
                    </label>
                    <input
                      type="text"
                      value={baseCode}
                      onChange={(e) => setBaseCode(e.target.value.toUpperCase())}
                      placeholder="WAGE or BASIC"
                      className="w-full text-xs uppercase font-mono border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                    />
                  </div>
                </div>
              )}

              {computeMethod === 'FORMULA' && (
                <div>
                  <label className="block text-xs font-semibold text-[#17233D] mb-1">
                    Formula Expression *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="e.g. BASIC + HRA + CONVEYANCE - PF"
                    className="w-full text-xs font-mono border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reference prior rule codes using standard mathematical symbols (+, -, *, /).
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addRuleMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2F5D82] hover:bg-[#254B68] rounded-lg shadow-sm disabled:opacity-50"
                >
                  {addRuleMutation.isPending ? 'Adding...' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
