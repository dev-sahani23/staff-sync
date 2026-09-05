import React from 'react';

interface ChartCardProps {
  title: string;
  caption?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  caption,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-none border-0 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-[#111827] tracking-tight">{title}</h3>
          {caption && <p className="text-xs text-gray-500 mt-0.5">{caption}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="w-full flex-1 min-h-[260px]">
        {children}
      </div>
    </div>
  );
};
