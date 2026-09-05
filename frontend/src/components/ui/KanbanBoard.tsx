import React, { useState, useMemo } from 'react';
import { StatusBadge } from './StatusBadge';
import {
  Briefcase,
  Building,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  Columns as ColumnsIcon,
  ChevronsUpDown,
} from 'lucide-react';
import type { Employee } from '@/types';

interface KanbanBoardProps {
  employees: Employee[];
  groupBy?: 'department' | 'status';
  onCardClick: (employee: Employee) => void;
  className?: string;
  pageSize?: number;
  defaultLayout?: 'grid' | 'columns';
}

// Preferred organizational department ordering
const PREFERRED_DEPT_ORDER = [
  'Engineering',
  'Product',
  'Design',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

// Department styling accents with bright minor coloring themes for dark mode
const DEPT_THEMES: Record<
  string,
  {
    pillBg: string;
    pillText: string;
    borderAccent: string;
    badgeBg: string;
    dotBg: string;
    cardBgDark: string;
    cardBorderDark: string;
    avatarBgDark: string;
    iconColor: string;
  }
> = {
  Engineering: {
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-700',
    borderAccent: 'border-l-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/40',
    dotBg: 'bg-blue-500',
    cardBgDark: 'dark:bg-[#131E2E] dark:hover:bg-[#18263A]',
    cardBorderDark: 'dark:border-blue-500/30 dark:hover:border-blue-400',
    avatarBgDark: 'dark:bg-blue-500/25 dark:text-blue-200 dark:border-blue-400/50',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  Product: {
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-700',
    borderAccent: 'border-l-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40',
    dotBg: 'bg-amber-500',
    cardBgDark: 'dark:bg-[#231C13] dark:hover:bg-[#2C2317]',
    cardBorderDark: 'dark:border-amber-500/30 dark:hover:border-amber-400',
    avatarBgDark: 'dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/50',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  Design: {
    pillBg: 'bg-purple-50',
    pillText: 'text-purple-700',
    borderAccent: 'border-l-purple-500',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 dark:border dark:border-purple-500/40',
    dotBg: 'bg-purple-500',
    cardBgDark: 'dark:bg-[#22152B] dark:hover:bg-[#2B1B36]',
    cardBorderDark: 'dark:border-purple-500/30 dark:hover:border-purple-400',
    avatarBgDark: 'dark:bg-purple-500/25 dark:text-purple-200 dark:border-purple-400/50',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
  'Human Resources': {
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
    borderAccent: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/40',
    dotBg: 'bg-emerald-500',
    cardBgDark: 'dark:bg-[#12221A] dark:hover:bg-[#172B21]',
    cardBorderDark: 'dark:border-emerald-500/30 dark:hover:border-emerald-400',
    avatarBgDark: 'dark:bg-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/50',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  Marketing: {
    pillBg: 'bg-rose-50',
    pillText: 'text-rose-700',
    borderAccent: 'border-l-rose-500',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/40',
    dotBg: 'bg-rose-500',
    cardBgDark: 'dark:bg-[#24131A] dark:hover:bg-[#2E1821]',
    cardBorderDark: 'dark:border-rose-500/30 dark:hover:border-rose-400',
    avatarBgDark: 'dark:bg-rose-500/25 dark:text-rose-200 dark:border-rose-400/50',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
  Sales: {
    pillBg: 'bg-indigo-50',
    pillText: 'text-indigo-700',
    borderAccent: 'border-l-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/40',
    dotBg: 'bg-indigo-500',
    cardBgDark: 'dark:bg-[#16172D] dark:hover:bg-[#1D1E3A]',
    cardBorderDark: 'dark:border-indigo-500/30 dark:hover:border-indigo-400',
    avatarBgDark: 'dark:bg-indigo-500/25 dark:text-indigo-200 dark:border-indigo-400/50',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
  },
  Finance: {
    pillBg: 'bg-teal-50',
    pillText: 'text-teal-700',
    borderAccent: 'border-l-teal-500',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 dark:border dark:border-teal-500/40',
    dotBg: 'bg-teal-500',
    cardBgDark: 'dark:bg-[#102120] dark:hover:bg-[#152B2A]',
    cardBorderDark: 'dark:border-teal-500/30 dark:hover:border-teal-400',
    avatarBgDark: 'dark:bg-teal-500/25 dark:text-teal-200 dark:border-teal-400/50',
    iconColor: 'text-teal-500 dark:text-teal-400',
  },
  Operations: {
    pillBg: 'bg-cyan-50',
    pillText: 'text-cyan-700',
    borderAccent: 'border-l-cyan-500',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40',
    dotBg: 'bg-cyan-500',
    cardBgDark: 'dark:bg-[#112128] dark:hover:bg-[#162A33]',
    cardBorderDark: 'dark:border-cyan-500/30 dark:hover:border-cyan-400',
    avatarBgDark: 'dark:bg-cyan-500/25 dark:text-cyan-200 dark:border-cyan-400/50',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
  },
};

const DEFAULT_THEME = {
  pillBg: 'bg-gray-50',
  pillText: 'text-gray-800',
  borderAccent: 'border-l-gray-400',
  badgeBg: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  dotBg: 'bg-gray-400',
  cardBgDark: 'dark:bg-[#1A1A22] dark:hover:bg-[#22222C]',
  cardBorderDark: 'dark:border-gray-700/50 dark:hover:border-gray-500',
  avatarBgDark: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
  iconColor: 'text-gray-500 dark:text-gray-400',
};

// Hierarchical ranking helper to structure employees logically within departments
function getRoleRank(jobPosition?: string | null): number {
  if (!jobPosition) return 99;
  const pos = jobPosition.toLowerCase();
  if (
    pos.includes('chief') ||
    pos.includes('cfo') ||
    pos.includes('coo') ||
    pos.includes('cmo') ||
    pos.includes('vp') ||
    pos.includes('director') ||
    pos.includes('head of') ||
    pos.includes('principal')
  ) {
    return 1; // Executive / Leadership
  }
  if (pos.includes('manager') || pos.includes('lead') || pos.includes('architect')) {
    return 2; // Management & Leads
  }
  if (
    pos.includes('senior') ||
    pos.includes('staff') ||
    pos.includes('specialist') ||
    pos.includes('researcher') ||
    pos.includes('sdet ii') ||
    pos.includes('engineer ii')
  ) {
    return 3; // Senior / Mid-Senior
  }
  if (
    pos.includes('junior') ||
    pos.includes('associate') ||
    pos.includes('coordinator') ||
    pos.includes('intern') ||
    pos.includes('trainee')
  ) {
    return 5; // Entry / Associate
  }
  return 4; // Core contributors
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  employees,
  groupBy = 'department',
  onCardClick,
  className = '',
  pageSize = 12,
  defaultLayout = 'grid',
}) => {
  // Layout mode: 'grid' (Equal Rows & Columns per department) or 'columns' (Equal-height vertical columns)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'columns'>(defaultLayout);
  // Per-department pagination state: tracks visible count for each department
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  // Sorting preference: 'hierarchy' (Leadership -> Seniors -> Core) or 'alphabetical' (A-Z)
  const [sortBy, setSortBy] = useState<'hierarchy' | 'alphabetical'>('hierarchy');

  // Group and structure employees
  const columns = useMemo(() => {
    const map = new Map<string, Employee[]>();

    for (const emp of employees) {
      const key = groupBy === 'department' ? emp.department || 'Unassigned' : emp.status;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(emp);
    }

    // Sort entries by preferred department structure
    const entries = Array.from(map.entries());
    if (groupBy === 'department') {
      entries.sort(([deptA], [deptB]) => {
        const idxA = PREFERRED_DEPT_ORDER.indexOf(deptA);
        const idxB = PREFERRED_DEPT_ORDER.indexOf(deptB);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        if (deptA === 'Unassigned') return 1;
        if (deptB === 'Unassigned') return -1;
        return deptA.localeCompare(deptB);
      });
    }

    // Sort employees within each department
    for (const [_, deptEmployees] of entries) {
      deptEmployees.sort((a, b) => {
        if (sortBy === 'hierarchy') {
          const rankA = getRoleRank(a.jobPosition);
          const rankB = getRoleRank(b.jobPosition);
          if (rankA !== rankB) return rankA - rankB;
        }
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return entries;
  }, [employees, groupBy, sortBy]);

  // Load more 12 employees for a specific department
  const handleLoadMore = (groupName: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [groupName]: (prev[groupName] || pageSize) + pageSize,
    }));
  };

  // Collapse back to the initial 12 employees
  const handleCollapse = (groupName: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [groupName]: pageSize,
    }));
  };

  // Expand all department sections
  const handleExpandAll = () => {
    const next: Record<string, number> = {};
    for (const [groupName, groupEmployees] of columns) {
      next[groupName] = groupEmployees.length;
    }
    setVisibleCounts(next);
  };

  // Collapse all department sections to 12
  const handleCollapseAll = () => {
    const next: Record<string, number> = {};
    for (const [groupName] of columns) {
      next[groupName] = pageSize;
    }
    setVisibleCounts(next);
  };

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1A1A1F] rounded-xl border border-dashed border-gray-200 dark:border-[#2D2D36]">
        <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">No employees match your filter.</div>
        <div className="text-xs text-gray-400 dark:text-slate-400 mt-1">Try resetting the department or search criteria.</div>
      </div>
    );
  }

  const anyExpanded = columns.some(([name]) => (visibleCounts[name] || pageSize) > pageSize);
  const anyHasMoreThanPage = columns.some(([_, emps]) => emps.length > pageSize);

  // Render Employee Card with bright minor coloring theme
  const renderEmployeeCard = (emp: Employee, theme: typeof DEPT_THEMES[string]) => {
    const initials = `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}`.toUpperCase();
    const isLeadRole = getRoleRank(emp.jobPosition) <= 2;

    return (
      <div
        key={emp.id}
        onClick={() => onCardClick(emp)}
        className={`bg-white ${theme.cardBgDark} rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border border-gray-200/80 ${theme.cardBorderDark} flex flex-col justify-between h-[128px] relative group ${
          isLeadRole ? `border-l-4 ${theme.borderAccent}` : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full bg-blue-50 ${theme.avatarBgDark} border border-blue-100 flex items-center justify-center font-bold text-xs text-[#3B82F6] shrink-0 transition-colors shadow-sm`}>
            {initials || 'EM'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h5 className="text-xs font-bold text-[#111827] dark:text-white truncate tracking-tight group-hover:text-[#3B82F6] dark:group-hover:text-blue-300 transition-colors">
                {emp.firstName} {emp.lastName}
              </h5>
              {isLeadRole && (
                <span title="Leadership / Senior Role">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-700 dark:text-slate-100 flex items-center gap-1.5 mt-0.5 truncate font-medium">
              <Briefcase className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
              <span className="truncate">{emp.jobPosition || 'Employee'}</span>
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 truncate max-w-[130px] font-semibold text-gray-700 dark:text-slate-200">
            <Building className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
            <span className="truncate">{emp.department || 'General'}</span>
          </span>
          <StatusBadge status={emp.status} />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Utility / Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#16161A] px-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-[#282830] text-xs text-gray-600 dark:text-slate-300 shadow-none transition-colors">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold text-[#111827] dark:text-white">{columns.length} Departments</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-gray-600 dark:text-slate-200">{employees.length} Total Personnel</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">12 per page</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Layout Mode Toggle: Equal Grid (Rows & Columns) vs Side-by-Side Columns */}
          <div className="flex items-center bg-[#F3F4F6] dark:bg-[#202026] p-0.5 rounded-lg border border-gray-200/60 dark:border-[#2D2D38]">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-[#2D2D38] text-[#111827] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Equal 4-Column Grid per Department"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Equal Rows & Cols</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('columns')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                layoutMode === 'columns'
                  ? 'bg-white dark:bg-[#2D2D38] text-[#111827] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Side-by-Side Department Columns"
            >
              <ColumnsIcon className="w-3.5 h-3.5" />
              <span>Columns</span>
            </button>
          </div>

          {/* Arrangement Sorter Toggle */}
          <button
            type="button"
            onClick={() => setSortBy((prev) => (prev === 'hierarchy' ? 'alphabetical' : 'hierarchy'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202026] hover:bg-gray-200 dark:hover:bg-[#2A2A33] text-gray-700 dark:text-slate-200 font-semibold transition-colors"
            title="Toggle Employee Arrangement"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            <span>Sort: {sortBy === 'hierarchy' ? 'Hierarchy' : 'A-Z'}</span>
          </button>

          {/* Quick Expand / Collapse All */}
          {anyHasMoreThanPage && (
            <button
              type="button"
              onClick={anyExpanded ? handleCollapseAll : handleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202026] hover:bg-gray-200 dark:hover:bg-[#2A2A33] text-gray-700 dark:text-slate-200 font-semibold transition-colors"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <span>{anyExpanded ? 'Reset to 12' : 'Expand All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: Equal Rows and Equal Columns (Department Grid) */}
      {layoutMode === 'grid' && (
        <div className="space-y-6">
          {columns.map(([groupName, groupEmployees]) => {
            const currentLimit = visibleCounts[groupName] || pageSize;
            const visibleEmployees = groupEmployees.slice(0, currentLimit);
            const hasMore = currentLimit < groupEmployees.length;
            const remainingCount = groupEmployees.length - currentLimit;
            const nextBatchSize = Math.min(pageSize, remainingCount);
            const theme = DEPT_THEMES[groupName] || DEFAULT_THEME;

            return (
              <div
                key={groupName}
                className="bg-white dark:bg-[#16161A] rounded-xl p-5 border border-gray-200/80 dark:border-[#282830] shadow-none transition-all space-y-4"
              >
                {/* Department Section Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${theme.dotBg} shrink-0 shadow-sm`} />
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
                      <span>{groupName}</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${theme.badgeBg}`}>
                      {groupEmployees.length} Personnel
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-gray-500 dark:text-slate-300 tabular-nums">
                    Showing {visibleEmployees.length} of {groupEmployees.length} employees
                  </div>
                </div>

                {/* Equal Grid: Exactly 4 Equal Columns with Equal Row Heights (12 cards = 3 equal rows × 4 equal columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleEmployees.map((emp) => renderEmployeeCard(emp, theme))}
                </div>

                {/* Pagination Controls / Load More Button for this Department */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/10">
                  <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">
                    {hasMore ? (
                      <span>{remainingCount} more employee{remainingCount > 1 ? 's' : ''} in {groupName}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ All {groupEmployees.length} employees displayed</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => handleLoadMore(groupName)}
                        className="px-5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-[#3B82F6] hover:text-blue-700 dark:text-blue-300 font-bold text-xs rounded-lg border border-blue-200 dark:border-blue-500/40 transition-all flex items-center gap-1.5 shadow-none group"
                      >
                        <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
                        <span>Load More (+{nextBatchSize})</span>
                      </button>
                    )}

                    {currentLimit > pageSize && (
                      <button
                        type="button"
                        onClick={() => handleCollapse(groupName)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white font-semibold hover:underline"
                      >
                        <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                        <span>Show Less (12)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 2: Side-by-Side Equalized Kanban Columns */}
      {layoutMode === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
          {columns.map(([groupName, groupEmployees]) => {
            const currentLimit = visibleCounts[groupName] || pageSize;
            const visibleEmployees = groupEmployees.slice(0, currentLimit);
            const hasMore = currentLimit < groupEmployees.length;
            const remainingCount = groupEmployees.length - currentLimit;
            const nextBatchSize = Math.min(pageSize, remainingCount);
            const theme = DEPT_THEMES[groupName] || DEFAULT_THEME;

            return (
              <div
                key={groupName}
                className="bg-[#F8F9FA] dark:bg-[#16161A] rounded-xl p-4 flex flex-col justify-between h-[720px] shadow-none border border-gray-200/80 dark:border-[#282830] transition-all"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-200 dark:border-white/10 shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.dotBg} shrink-0`} />
                    <h4 className="text-sm font-bold text-[#111827] dark:text-white truncate tracking-tight">
                      {groupName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${theme.badgeBg}`}>
                      {groupEmployees.length}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-gray-500 dark:text-slate-300 tabular-nums">
                    {visibleEmployees.length} / {groupEmployees.length}
                  </div>
                </div>

                {/* Cards Container with smooth scroll for equal column height */}
                <div className="flex-1 overflow-y-auto pr-1 py-3 flex flex-col gap-2.5 space-y-0.5">
                  {visibleEmployees.map((emp) => renderEmployeeCard(emp, theme))}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-gray-200 dark:border-white/10 shrink-0">
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={() => handleLoadMore(groupName)}
                      className="w-full py-2 px-3 bg-white dark:bg-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/30 active:bg-blue-100 text-[#3B82F6] hover:text-blue-700 dark:text-blue-300 font-bold text-xs rounded-lg border border-blue-200 dark:border-blue-500/40 transition-all flex items-center justify-center gap-1.5 shadow-none group"
                    >
                      <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
                      <span>Load More (+{nextBatchSize})</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-300 px-1 font-medium">
                      <span>All {groupEmployees.length} loaded</span>
                      {currentLimit > pageSize && (
                        <button
                          type="button"
                          onClick={() => handleCollapse(groupName)}
                          className="text-[#3B82F6] dark:text-blue-400 hover:underline font-bold"
                        >
                          Collapse (12)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
