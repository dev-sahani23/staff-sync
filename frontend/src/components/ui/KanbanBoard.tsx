import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Briefcase, Building } from 'lucide-react';
import type { Employee } from '@/types';

interface KanbanBoardProps {
  employees: Employee[];
  groupBy?: 'department' | 'status';
  onCardClick: (employee: Employee) => void;
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  employees,
  groupBy = 'department',
  onCardClick,
  className = '',
}) => {
  // Group employees
  const grouped = React.useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const key = groupBy === 'department' ? emp.department || 'Unassigned' : emp.status;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(emp);
    }
    return map;
  }, [employees, groupBy]);

  const columns = Array.from(grouped.entries());

  if (employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-medium">No employees to display.</div>;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start ${className}`}>
      {columns.map(([groupName, groupEmployees]) => (
        <div
          key={groupName}
          className="bg-[#F3F4F6] rounded-lg p-4 flex flex-col gap-3 shadow-none border-0"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between px-1 pb-1">
            <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2 tracking-tight">
              <span>{groupName}</span>
              <span className="bg-white text-gray-800 px-2 py-0.5 rounded-md text-xs font-bold tabular-nums shadow-none">
                {groupEmployees.length}
              </span>
            </h4>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2.5">
            {groupEmployees.map((emp) => {
              const initials = `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}`.toUpperCase();
              return (
                <div
                  key={emp.id}
                  onClick={() => onCardClick(emp)}
                  className="bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-none border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-[#3B82F6] shrink-0 shadow-none">
                      {initials || 'EM'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-[#111827] truncate tracking-tight">
                        {emp.firstName} {emp.lastName}
                      </h5>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{emp.jobPosition || 'Employee'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                      <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{emp.department || 'General'}</span>
                    </span>
                    <StatusBadge status={emp.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
