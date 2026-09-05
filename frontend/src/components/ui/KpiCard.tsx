import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KpiVariant = 'default' | 'blue' | 'emerald' | 'amber' | 'purple';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  caption?: string;
  icon?: LucideIcon;
  variant?: KpiVariant;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<KpiVariant, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
  default: {
    bg: 'bg-white hover:bg-gray-50',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-700',
    valueColor: 'text-[#111827]',
  },
  blue: {
    bg: 'bg-blue-50/80 hover:bg-blue-100/80',
    iconBg: 'bg-white',
    iconColor: 'text-[#3B82F6]',
    valueColor: 'text-blue-950',
  },
  emerald: {
    bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    iconBg: 'bg-white',
    iconColor: 'text-[#10B981]',
    valueColor: 'text-emerald-950',
  },
  amber: {
    bg: 'bg-amber-50/80 hover:bg-amber-100/80',
    iconBg: 'bg-white',
    iconColor: 'text-[#F59E0B]',
    valueColor: 'text-amber-950',
  },
  purple: {
    bg: 'bg-indigo-50/80 hover:bg-indigo-100/80',
    iconBg: 'bg-white',
    iconColor: 'text-indigo-600',
    valueColor: 'text-indigo-950',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaType = 'neutral',
  caption,
  icon: Icon,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`group rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between shadow-none border-0 ${styles.bg} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-full ${styles.iconBg} ${styles.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-none`}
          >
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="my-3">
        <div className={`text-3xl font-extrabold tabular-nums tracking-tight ${styles.valueColor}`}>
          {value}
        </div>
      </div>

      {(delta || caption) && (
        <div className="flex items-center gap-2 text-xs font-medium">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                deltaType === 'positive'
                  ? 'text-[#10B981]'
                  : deltaType === 'negative'
                  ? 'text-[#EF4444]'
                  : 'text-gray-600'
              }`}
            >
              {deltaType === 'positive' && <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />}
              {deltaType === 'negative' && <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />}
              {delta}
            </span>
          )}
          {caption && <span className="text-gray-500 truncate">{caption}</span>}
        </div>
      )}
    </div>
  );
};
