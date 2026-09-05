import React from 'react';
import { FolderOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-none border-0 my-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#3B82F6] mb-4 shadow-none">
        <Icon className="w-7 h-7 stroke-[2.2]" />
      </div>
      <h3 className="text-lg font-bold text-[#111827] tracking-tight">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 h-11 rounded-md bg-[#3B82F6] text-white text-sm font-semibold hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
