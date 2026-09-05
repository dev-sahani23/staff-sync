import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: Breadcrumb[];
    actions?: ReactNode;
    subtitle?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8">
            <div>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center space-x-1 text-sm text-slate-500 mb-2">
                        {breadcrumbs.map((bc, idx) => (
                            <div key={idx} className="flex items-center">
                                {bc.href ? (
                                    <Link to={bc.href} className="hover:text-slate-900 transition-colors">
                                        {bc.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-900 font-medium">{bc.label}</span>
                                )}
                                {idx < breadcrumbs.length - 1 && (
                                    <ChevronRight className="h-4 w-4 mx-1" />
                                )}
                            </div>
                        ))}
                    </nav>
                )}
                <div>
                    <h1 className="text-3xl text-slate-800 tracking-tight font-medium mb-1">{title}</h1>
                    {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
                </div>
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
