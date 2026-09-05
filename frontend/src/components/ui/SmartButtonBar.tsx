import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SmartButton {
  label: string;
  count?: number | string;
  icon?: LucideIcon;
  onClick: () => void;
  active?: boolean;
}

interface SmartButtonBarProps {
  buttons: SmartButton[];
  className?: string;
}

export const SmartButtonBar: React.FC<SmartButtonBarProps> = ({ buttons, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 pb-4 ${className}`}>
      {buttons.map((btn, idx) => {
        const Icon = btn.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={btn.onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-none border-0 ${
              btn.active
                ? 'bg-[#3B82F6] text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-[#3B82F6]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 stroke-[2.2]" />}
            <span>{btn.label}</span>
            {btn.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold tabular-nums shadow-none ${
                  btn.active
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {btn.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
