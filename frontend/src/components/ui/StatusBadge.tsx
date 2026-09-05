import React from 'react';

export type StatusVariant = 
  | 'active' | 'running' | 'paid' | 'approved' | 'present' | 'done'
  | 'pending' | 'to_approve' | 'draft' | 'computed' | 'validated' | 'late'
  | 'expired' | 'terminated' | 'inactive' | 'refused' | 'absent' | 'exception' | 'rejected';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toLowerCase().replace(/\s+/g, '_');

  let dotColor = 'bg-gray-500';
  let textColor = 'text-gray-800';
  let bgColor = 'bg-gray-100';

  if (['active', 'running', 'paid', 'approved', 'present', 'done'].includes(norm)) {
    dotColor = 'bg-[#10B981]';
    textColor = 'text-emerald-800';
    bgColor = 'bg-emerald-100';
  } else if (['pending', 'to_approve', 'draft', 'computed', 'validated', 'late'].includes(norm)) {
    dotColor = 'bg-[#F59E0B]';
    textColor = 'text-amber-900';
    bgColor = 'bg-amber-100';
  } else if (['expired', 'terminated', 'inactive', 'refused', 'absent', 'exception', 'rejected'].includes(norm)) {
    dotColor = 'bg-[#EF4444]';
    textColor = 'text-rose-800';
    bgColor = 'bg-rose-100';
  }

  // Format label: capitalize words cleanly
  const label = status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold shadow-none border-0 ${bgColor} ${textColor} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
