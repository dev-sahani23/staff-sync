import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mb-5 ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 stroke-[2.5] shrink-0" />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-[#3B82F6] dark:hover:text-blue-400 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-bold ${isLast ? 'text-[#111827] dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
