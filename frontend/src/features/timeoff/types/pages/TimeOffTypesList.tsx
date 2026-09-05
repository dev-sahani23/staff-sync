import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeoffApi } from '@/services/timeoff';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { Plus, X, Tag } from 'lucide-react';
import type { TimeOffType } from '@/types';

export const TimeOffTypesList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'DAYS' | 'HOURS'>('DAYS');
  const [requiresAllocation, setRequiresAllocation] = useState(true);
  const [isPayrollIntegrated, setIsPayrollIntegrated] = useState(true);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['timeoff', 'types'],
    queryFn: timeoffApi.getTypes,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<TimeOffType>) => timeoffApi.createType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff', 'types'] });
      setIsModalOpen(false);
      setName('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create time off type');
    },
  });

  const columns: Column<TimeOffType>[] = [
    {
      key: 'name',
      header: 'Policy Name',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-2 font-semibold text-[#17233D]">
          <Tag className="w-4 h-4 text-[#2F5D82]" />
          <span>{t.name}</span>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Accounting Unit',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {t.unit}
        </span>
      ),
    },
    {
      key: 'requiresAllocation',
      header: 'Requires Allocation',
      render: (t) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            t.requiresAllocation
              ? 'bg-emerald-50 text-[#1E7A4C]'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {t.requiresAllocation ? 'Yes (Fixed Balance)' : 'No (Unlimited)'}
        </span>
      ),
    },
    {
      key: 'isPayrollIntegrated',
      header: 'Payroll Integrated',
      render: (t) => (
        <span className="text-xs text-slate-600">
          {t.isPayrollIntegrated ? 'Deducts Unpaid from Wage' : 'Informational Only'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Time Off', href: '/timeoff' },
          { label: 'Types & Policies' },
        ]}
      />

      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Time Off Types</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Leave categories, allocation rules, and payroll deduction configurations
          </p>
        </div>

        <Can permission="timeoff:write">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] text-white text-xs font-semibold rounded-lg hover:bg-[#254B68] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Leave Type
          </button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={types}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyTitle="No time off types configured"
        emptyDescription="Create leave policies such as Paid Time Off, Sick Leave, or Parental Leave."
        emptyActionText="Create Leave Type"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#DDE3EC] shadow-2xl w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#17233D]">Create Time Off Type</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  name,
                  unit,
                  requiresAllocation,
                  isPayrollIntegrated,
                });
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#17233D] mb-1">
                  Policy Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Annual Vacation, Sick Leave"
                  className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233D] mb-1">
                  Accounting Unit *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full text-xs border border-[#DDE3EC] rounded-lg p-2 outline-none focus:border-[#2F5D82]"
                >
                  <option value="DAYS">DAYS (Standard Calendar Days)</option>
                  <option value="HOURS">HOURS (Hourly Tracking)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={requiresAllocation}
                    onChange={(e) => setRequiresAllocation(e.target.checked)}
                    className="rounded border-[#DDE3EC] text-[#2F5D82] focus:ring-[#2F5D82]"
                  />
                  <span>Requires Allocation (Deducts from granted employee balance)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPayrollIntegrated}
                    onChange={(e) => setIsPayrollIntegrated(e.target.checked)}
                    className="rounded border-[#DDE3EC] text-[#2F5D82] focus:ring-[#2F5D82]"
                  />
                  <span>Payroll Integrated (Unpaid days reduce gross salary in payruns)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2F5D82] hover:bg-[#254B68] rounded-lg shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
