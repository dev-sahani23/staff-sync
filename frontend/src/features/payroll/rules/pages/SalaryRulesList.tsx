import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { salaryStructuresApi } from '@/services/salary-structures';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Layers } from 'lucide-react';
import type { SalaryRule } from '@/types';

interface FlattenedRule extends SalaryRule {
  structureName: string;
}

export const SalaryRulesList: React.FC = () => {
  const { data: structures = [], isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: salaryStructuresApi.list,
  });

  // Collect rules across structures
  const allRules: FlattenedRule[] = React.useMemo(() => {
    const list: FlattenedRule[] = [];
    for (const s of structures) {
      if (s.rules) {
        for (const r of s.rules) {
          list.push({ ...r, structureName: s.name });
        }
      }
    }
    return list.sort((a, b) => a.sequence - b.sequence);
  }, [structures]);

  const columns: Column<FlattenedRule>[] = [
    {
      key: 'sequence',
      header: 'Seq',
      sortable: true,
      render: (r) => (
        <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded tabular-nums">
          #{r.sequence}
        </span>
      ),
    },
    {
      key: 'code',
      header: 'Rule Code',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-xs text-[#2F5D82] bg-[#EAF1F6] px-2 py-0.5 rounded">
          {r.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Rule Description',
      sortable: true,
      render: (r) => <span className="font-semibold text-[#17233D]">{r.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (r) => {
        let color = 'bg-slate-100 text-slate-700';
        if (r.category === 'BASIC') color = 'bg-blue-50 text-blue-700';
        if (r.category === 'ALLOWANCE') color = 'bg-emerald-50 text-[#1E7A4C]';
        if (r.category === 'DEDUCTION') color = 'bg-rose-50 text-[#B23B3B]';
        if (r.category === 'NET') color = 'bg-purple-50 text-purple-700';
        return (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${color}`}>
            {r.category}
          </span>
        );
      },
    },
    {
      key: 'computeMethod',
      header: 'Computation',
      render: (r) => (
        <div className="text-xs">
          <span className="font-medium text-slate-700">{r.computeMethod}</span>
          {r.computeMethod === 'PERCENTAGE' && (
            <span className="text-slate-500 ml-1">({r.amount}% of {r.baseCode || 'WAGE'})</span>
          )}
          {r.computeMethod === 'FIXED' && (
            <span className="text-slate-500 ml-1">(₹{r.amount?.toLocaleString('en-IN')})</span>
          )}
          {r.computeMethod === 'FORMULA' && (
            <span className="text-slate-500 ml-1 font-mono text-[11px]">[{r.formula}]</span>
          )}
        </div>
      ),
    },
    {
      key: 'structureName',
      header: 'Assigned Structure',
      render: (r) => (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-400" />
          {r.structureName}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Payroll', href: '/payroll' },
          { label: 'Salary Rules' },
        ]}
      />

      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Salary Rules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation definitions: basic wage, allowances, statutory deductions, and net formulation
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allRules}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No salary rules configured"
        emptyDescription="Define salary structures with included rules to compute employee pay."
      />
    </div>
  );
};
